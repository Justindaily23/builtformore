// When can people register, and which places are taken?
import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import { hasEnded } from "@/lib/event-dates";
import type { events, ticketOptions } from "@/server/db/schema";
import { registrations } from "@/server/db/schema";
import type { Db, Tx } from "@/server/events/service";

type Event = typeof events.$inferSelect;
type Ticket = typeof ticketOptions.$inferSelect;

/** Tickets a visitor can choose. A hidden price can never be registered for. */
export const offeredTickets = <T extends Pick<Ticket, "isActive" | "showPrice">>(tickets: T[]) =>
  tickets.filter((t) => t.isActive && t.showPrice);

/**
 * What still has to be done before registration can open. Used both for the
 * admin checklist and to guard the public form.
 */
export function setupProblems(event: Event, tickets: Ticket[], now = new Date()): string[] {
  const problems: string[] = [];
  const active = tickets.filter((t) => t.isActive);
  if (event.publishStatus !== "published") problems.push("Publish the event.");
  if (hasEnded(event, now)) problems.push("The event has ended.");
  if (event.registrationDeadline && event.registrationDeadline <= now) {
    problems.push("The registration deadline has passed. Change or clear it in the event details.");
  }
  if (!active.length) problems.push("Add at least one available ticket.");
  if (active.some((t) => !t.showPrice)) {
    problems.push("Tick Show price on every available ticket, so people know what they will pay (or turn the ticket off).");
  }
  if (!event.contactEmail && !event.contactPhone && !event.contactWhatsapp) {
    problems.push("Add an event contact (email, phone or WhatsApp) in the event details, so registrants can reach you.");
  }
  if (active.some((t) => t.priceKobo > 0) && !event.paymentInstructions) {
    problems.push("Add payment instructions (the owner does this).");
  }
  return problems;
}

/** Places in use: confirmed, or unpaid but still within the holding time. */
export const holdsPlace = (now = new Date()) =>
  or(
    eq(registrations.status, "confirmed"),
    and(eq(registrations.status, "pending"), or(isNull(registrations.holdExpiresAt), gt(registrations.holdExpiresAt, now))),
  );

export async function placesTaken(db: Db | Tx, eventId: string, now = new Date()) {
  const rows = await db
    .select({ ticketId: registrations.ticketOptionId, total: count() })
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), holdsPlace(now)))
    .groupBy(registrations.ticketOptionId);
  return {
    total: rows.reduce((sum, r) => sum + r.total, 0),
    byTicket: new Map(rows.map((r) => [r.ticketId, r.total])),
  };
}

export function isFull(
  event: Pick<Event, "capacity">, ticket: Pick<Ticket, "id" | "capacity">, taken: Awaited<ReturnType<typeof placesTaken>>,
) {
  return (
    (event.capacity !== null && taken.total >= event.capacity) ||
    (ticket.capacity !== null && (taken.byTicket.get(ticket.id) ?? 0) >= ticket.capacity)
  );
}
