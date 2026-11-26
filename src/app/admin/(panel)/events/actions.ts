"use server";

// Server Actions can be called directly by anyone, not only through our
// buttons. So EVERY action here checks permission and validates its input.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { failed, invalid, success, text } from "@/server/events/action-helpers";
import type { FormState } from "@/lib/form-state";
import { requirePermission } from "@/server/auth/session";
import { getDb } from "@/server/db";
import * as service from "@/server/events/service";
import { eventSchema, paymentInstructionsSchema, publishChoice, registrationChoice, ticketSchema } from "@/server/events/validation";

const uuid = z.uuid();

const eventFields = [
  "title", "slug", "theme", "summary", "description", "startDate", "endDate", "venue", "address", "mapUrl",
  "audience", "accessibilityNotes", "contactEmail", "contactPhone", "contactWhatsapp", "capacity",
  "registrationDeadline", "onlineHoldMinutes", "transferHoldHours",
] as const;

// Only these named fields are read. Anything extra in a request is ignored.
const readEvent = (form: FormData) => Object.fromEntries(eventFields.map((key) => [key, text(form, key)]));

export async function createEventAction(previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = eventSchema.safeParse(readEvent(form));
  if (!parsed.success) return invalid(previous, parsed.error);
  let id: string;
  try {
    id = await service.createEvent(getDb(), admin.id, parsed.data);
  } catch (error) {
    return failed(previous, error);
  }
  redirect(`/admin/events/${id}`);
}

export async function updateEventAction(eventId: string, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = eventSchema.safeParse(readEvent(form));
  if (!parsed.success) return invalid(previous, parsed.error);
  try {
    await service.updateEvent(getDb(), admin.id, uuid.parse(eventId), text(form, "version"), parsed.data);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, "Event saved.");
}

export type StatusChange =
  | { type: "publish"; value: string }
  | { type: "featured"; value: boolean }
  | { type: "registration"; value: string };

export async function changeStatusAction(eventId: string, change: StatusChange): Promise<{ ok: boolean; message: string }> {
  const admin = await requirePermission("manage_events");
  try {
    const id = uuid.parse(eventId);
    if (change.type === "publish") {
      await service.setPublishStatus(getDb(), admin.id, id, publishChoice.parse(change.value));
    } else if (change.type === "featured") {
      await service.setFeatured(getDb(), admin.id, id, z.boolean().parse(change.value));
    } else if (change.type === "registration") {
      await service.setRegistrationStatus(getDb(), admin.id, id, registrationChoice.parse(change.value));
    } else {
      return { ok: false, message: "Unknown change." };
    }
  } catch (error) {
    return { ok: false, message: failed({ saved: 0 }, error).message! };
  }
  refresh();
  return { ok: true, message: "Updated." };
}

export async function saveTicketAction(
  eventId: string, ticketId: string | null, previous: FormState, form: FormData,
): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = ticketSchema.safeParse({
    name: text(form, "name"),
    description: text(form, "description"),
    price: text(form, "price"),
    capacity: text(form, "capacity"),
    sortOrder: text(form, "sortOrder"),
    isActive: form.get("isActive") === "on",
    showPrice: form.get("showPrice") === "on",
  });
  if (!parsed.success) return invalid(previous, parsed.error);
  try {
    await service.saveTicket(getDb(), admin.id, uuid.parse(eventId), ticketId === null ? null : uuid.parse(ticketId), parsed.data);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, ticketId ? "Ticket saved." : "Ticket added.");
}

export async function deleteTicketAction(eventId: string, ticketId: string): Promise<{ ok: boolean; message: string }> {
  const admin = await requirePermission("manage_events");
  try {
    await service.deleteTicket(getDb(), admin.id, uuid.parse(eventId), uuid.parse(ticketId));
  } catch (error) {
    return { ok: false, message: failed({ saved: 0 }, error).message! };
  }
  refresh();
  return { ok: true, message: "Ticket deleted." };
}

export async function savePaymentInstructionsAction(eventId: string, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_payment_settings");
  const parsed = paymentInstructionsSchema.safeParse({ paymentInstructions: text(form, "paymentInstructions") });
  if (!parsed.success) return invalid(previous, parsed.error);
  try {
    await service.savePaymentInstructions(getDb(), admin.id, uuid.parse(eventId), parsed.data.paymentInstructions);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, "Payment instructions saved.");
}
