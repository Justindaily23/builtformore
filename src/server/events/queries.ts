// Reading events for the admin panel. Callers must check permission first.
import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { events, ticketOptions } from "@/server/db/schema";

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
