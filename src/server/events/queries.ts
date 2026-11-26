// Reading events for the admin panel. Callers must check permission first.
import "server-only";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { events, registrations, ticketOptions } from "@/server/db/schema";
import { holdsPlace } from "@/server/registration/rules";

export function listEvents() {
  return getDb().select().from(events).orderBy(desc(events.startDate), asc(events.title));
}

export async function getEventForEdit(id: string) {
  // Reject anything that is not an ID before it reaches the database.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const event = await getDb().query.events.findFirst({
    where: eq(events.id, id),
    with: {
      tickets: { orderBy: [asc(ticketOptions.sortOrder), asc(ticketOptions.createdAt)] },
      days: true,
    },
  });
  return event ?? null;
}

export type EditableEvent = NonNullable<Awaited<ReturnType<typeof getEventForEdit>>>;

/** Totals only. The participant list comes in the next step. */
export async function getRegistrationCounts(eventId: string) {
  const db = getDb();
  const mine = eq(registrations.eventId, eventId);
  const [held] = await db.select({
    confirmed: count(sql`case when ${registrations.status} = 'confirmed' then 1 end`),
    awaiting: count(sql`case when ${registrations.status} = 'pending' then 1 end`),
  }).from(registrations).where(and(mine, holdsPlace()));
  const [all] = await db.select({ total: count() }).from(registrations).where(mine);
  return { ...held, lapsed: all.total - held.confirmed - held.awaiting };
}
