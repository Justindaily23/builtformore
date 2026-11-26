// What the public may know about registration for one event. Only says whether
// an option is full, never how many people have registered.
import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { hasEnded } from "@/lib/event-dates";
import { currentRegistrationStatus } from "@/lib/registration-state";
import { getDb } from "@/server/db";
import { events, ticketOptions } from "@/server/db/schema";
import { slugPattern } from "@/server/events/validation";
import { isFull, offeredTickets, placesTaken, setupProblems } from "@/server/registration/rules";

export const getRegistrationInfo = cache(async (slug: string) => {
  if (slug.length > 80 || !slugPattern.test(slug)) return null;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.slug, slug));
  if (!event || event.publishStatus !== "published") return null;
  const tickets = await db.select().from(ticketOptions).where(eq(ticketOptions.eventId, event.id))
    .orderBy(asc(ticketOptions.sortOrder), asc(ticketOptions.createdAt));
  const base = { slug: event.slug, title: event.title, startDate: event.startDate, endDate: event.endDate };

  const status = hasEnded(event) ? "closed" : currentRegistrationStatus(event);
  // Marked open but something is missing: do not offer a form.
  if (status !== "open" || setupProblems(event, tickets).length) {
    return { ...base, state: status === "closed" ? ("closed" as const) : ("coming_soon" as const), tickets: [] };
  }
  const taken = await placesTaken(db, event.id);
  const options = offeredTickets(tickets).map((ticket) => ({
    id: ticket.id, name: ticket.name, description: ticket.description, priceKobo: ticket.priceKobo,
    soldOut: isFull(event, ticket, taken),
  }));
  return { ...base, state: options.every((t) => t.soldOut) ? ("full" as const) : ("open" as const), tickets: options };
});

export type RegistrationOption = NonNullable<Awaited<ReturnType<typeof getRegistrationInfo>>>["tickets"][number];
