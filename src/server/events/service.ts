// Event rules and database changes. Callers MUST check permission first (see
// the admin actions). Not marked "server-only" so that scripts can test it.
import { and, count, eq, ne, or, lt, gt } from "drizzle-orm";
import type { createDb } from "@/server/db/client";
import { activityLog, eventDays, events, registrations, ticketOptions } from "@/server/db/schema";
import { holdsPlace, setupProblems } from "@/server/registration/rules";
import { fromLocalInput } from "@/lib/datetime";
import type { EventInput, TicketInput } from "./validation";

export type Db = ReturnType<typeof createDb>["db"];
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** A rule was broken. The message is safe to show to the admin. */
export class RuleError extends Error {
  constructor(message: string, readonly field?: string) {
    super(message);
  }
}

/** Finds the name of a broken database constraint, if that caused the error. */
export function constraintOf(error: unknown): string | undefined {
  for (let e = error as { constraint?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (e.constraint) return e.constraint;
  }
}

async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    switch (constraintOf(error)) {
      case "events_slug_unique":
        throw new RuleError("Another event already uses this web address.", "slug");
      case "ticket_options_event_name":
        throw new RuleError("This event already has a ticket with that name.", "name");
      case "events_one_featured":
        throw new RuleError("Someone else changed the featured event. Reload and try again.");
      case "registrations_ticket_fk":
        throw new RuleError("This ticket has registrations, so it cannot be deleted. Turn it off instead.");
      default:
        throw error;
    }
  }
}

/** Locks the event so two changes to it cannot happen at the same moment. */
export async function lockEvent(tx: Tx, eventId: string) {
  const [event] = await tx.select().from(events).where(eq(events.id, eventId)).for("update");
  if (!event) throw new RuleError("This event no longer exists.");
  return event;
}

export function log(tx: Tx, adminId: string, action: string, entityType: string, entityId: string, details?: Record<string, unknown>) {
  return tx.insert(activityLog).values({ adminId, action, entityType, entityId, details });
}

async function takenPlaces(tx: Tx, eventId: string, ticketId?: string) {
  const [row] = await tx
    .select({ total: count() })
    .from(registrations)
    .where(and(
      eq(registrations.eventId, eventId),
      ticketId ? eq(registrations.ticketOptionId, ticketId) : undefined,
      holdsPlace(),
    ));
  return row.total;
}

function toRow({ registrationDeadline, ...input }: EventInput, timeZone: string) {
  return { ...input, registrationDeadline: registrationDeadline ? fromLocalInput(registrationDeadline, timeZone) : null };
}

export function createEvent(db: Db, adminId: string, input: EventInput) {
  return guard(() => db.transaction(async (tx) => {
    // New events always start as hidden drafts.
    const [event] = await tx.insert(events).values(toRow(input, "Africa/Lagos")).returning({ id: events.id });
    await log(tx, adminId, "event.created", "event", event.id, { title: input.title });
    return event.id;
  }));
}

/** version is the updatedAt time the admin's form was loaded with. */
export function updateEvent(db: Db, adminId: string, eventId: string, version: string, input: EventInput) {
  return guard(() => db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    if (current.updatedAt.toISOString() !== version) {
      throw new RuleError("This event was changed somewhere else after you opened it. Copy your edits, reload the page, then try again.");
    }
    if (input.capacity !== null) {
      const taken = await takenPlaces(tx, eventId);
      if (input.capacity < taken) throw new RuleError(`${taken} places are already taken.`, "capacity");
    }
    const next = toRow(input, current.timezone);
    const changed = (Object.keys(next) as (keyof typeof next)[]).filter(
      (key) => String(next[key] ?? "") !== String(current[key] ?? ""),
    );

    // Schedule days outside the new dates must not be shown to the public.
    const [outside] = await tx.select({ total: count() }).from(eventDays).where(
      and(eq(eventDays.eventId, eventId), or(lt(eventDays.date, input.startDate), gt(eventDays.date, input.endDate))),
    );
    const hideSchedule = outside.total > 0 && current.showSchedule;

    await tx.update(events)
      .set({ ...next, ...(hideSchedule ? { showSchedule: false } : {}) })
      .where(eq(events.id, eventId));
    // Field names only: contact details are not copied into the log.
    await log(tx, adminId, "event.updated", "event", eventId, { changed, ...(hideSchedule ? { scheduleHidden: true } : {}) });
  }));
}

export function setPublishStatus(db: Db, adminId: string, eventId: string, status: "draft" | "published" | "archived") {
  return guard(() => db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    // Only a published event can be featured.
    const isFeatured = status === "published" ? current.isFeatured : false;
    await tx.update(events).set({ publishStatus: status, isFeatured }).where(eq(events.id, eventId));
    await log(tx, adminId, "event.status_changed", "event", eventId, {
      from: current.publishStatus, to: status, ...(current.isFeatured && !isFeatured ? { unfeatured: true } : {}),
    });
  }));
}

export function setFeatured(db: Db, adminId: string, eventId: string, featured: boolean) {
  return guard(() => db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    if (featured) {
      if (current.publishStatus !== "published") throw new RuleError("Publish the event before featuring it.");
      await tx.update(events).set({ isFeatured: false }).where(and(eq(events.isFeatured, true), ne(events.id, eventId)));
    }
    await tx.update(events).set({ isFeatured: featured }).where(eq(events.id, eventId));
    await log(tx, adminId, featured ? "event.featured" : "event.unfeatured", "event", eventId);
  }));
}

export function setRegistrationStatus(db: Db, adminId: string, eventId: string, status: "coming_soon" | "open" | "closed") {
  return db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    if (status === "open") {
      const tickets = await tx.select().from(ticketOptions).where(eq(ticketOptions.eventId, eventId));
      const problems = setupProblems(current, tickets);
      if (problems.length) throw new RuleError(`Registration cannot open yet. ${problems.join(" ")}`);
    }
    await tx.update(events).set({ registrationStatus: status }).where(eq(events.id, eventId));
    await log(tx, adminId, "event.registration_changed", "event", eventId, { from: current.registrationStatus, to: status });
  });
}

/** Owner only (checked by the action): changing bank details can divert money. */
export function savePaymentInstructions(db: Db, adminId: string, eventId: string, paymentInstructions: string | null) {
  return db.transaction(async (tx) => {
    const current = await lockEvent(tx, eventId);
    await tx.update(events).set({ paymentInstructions }).where(eq(events.id, eventId));
    // Both versions are kept, so any change to bank details can be traced.
    await log(tx, adminId, "event.payment_instructions_changed", "event", eventId, {
      before: current.paymentInstructions, after: paymentInstructions,
    });
  });
}

/** ticketId is null for a new ticket. */
export function saveTicket(db: Db, adminId: string, eventId: string, ticketId: string | null, input: TicketInput) {
  return guard(() => db.transaction(async (tx) => {
    await lockEvent(tx, eventId);
    const { price: priceKobo, ...rest } = input;
    const values = { ...rest, priceKobo };

    if (!ticketId) {
      const [ticket] = await tx.insert(ticketOptions).values({ eventId, ...values }).returning({ id: ticketOptions.id });
      await log(tx, adminId, "ticket.created", "ticket_option", ticket.id, { eventId, name: input.name, priceKobo });
      return;
    }
    // Match the event too, so a ticket from another event cannot be edited.
    const match = and(eq(ticketOptions.id, ticketId), eq(ticketOptions.eventId, eventId));
    const [current] = await tx.select().from(ticketOptions).where(match);
    if (!current) throw new RuleError("This ticket no longer exists.");
    if (input.capacity !== null) {
      const taken = await takenPlaces(tx, eventId, ticketId);
      if (input.capacity < taken) throw new RuleError(`${taken} places are already taken.`, "capacity");
    }
    await tx.update(ticketOptions).set(values).where(match);
    await log(tx, adminId, "ticket.updated", "ticket_option", ticketId, {
      eventId,
      before: { name: current.name, priceKobo: current.priceKobo, capacity: current.capacity, isActive: current.isActive, showPrice: current.showPrice },
      after: { name: input.name, priceKobo, capacity: input.capacity, isActive: input.isActive, showPrice: input.showPrice },
    });
  }));
}

export function deleteTicket(db: Db, adminId: string, eventId: string, ticketId: string) {
  return guard(() => db.transaction(async (tx) => {
    await lockEvent(tx, eventId);
    // The database refuses if anyone has registered with this ticket.
    const [gone] = await tx.delete(ticketOptions)
      .where(and(eq(ticketOptions.id, ticketId), eq(ticketOptions.eventId, eventId)))
      .returning({ name: ticketOptions.name, priceKobo: ticketOptions.priceKobo });
    if (!gone) throw new RuleError("This ticket no longer exists.");
    await log(tx, adminId, "ticket.deleted", "ticket_option", ticketId, { eventId, ...gone });
  }));
}
