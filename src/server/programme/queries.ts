// Reading speakers and the schedule for the admin panel (includes hidden
// items). Callers must check permission first.
import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { eventDays, events, eventSessions, eventSpeakers, speakers } from "@/server/db/schema";

const isId = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function getProgrammeForEdit(id: string) {
  if (!isId(id)) return null;
  const event = await getDb().query.events.findFirst({
    where: eq(events.id, id),
    with: {
      speakers: { orderBy: [asc(eventSpeakers.sortOrder), asc(eventSpeakers.createdAt)], with: { speaker: { with: { appearances: { columns: { eventId: true } } } } } },
      days: {
        orderBy: [asc(eventDays.date)],
        with: {
          sessions: {
            orderBy: [asc(eventSessions.sortOrder), asc(eventSessions.startTime), asc(eventSessions.createdAt)],
            with: { speakers: true },
          },
        },
      },
    },
  });
  return event ?? null;
}

/** People from any event, for adding someone again. */
export function listSpeakerProfiles() {
  return getDb().select({ id: speakers.id, name: speakers.name, professionalTitle: speakers.professionalTitle })
    .from(speakers).orderBy(asc(speakers.name));
}
