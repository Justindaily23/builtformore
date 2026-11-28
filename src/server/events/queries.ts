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

/** Totals only. Participant details are read separately by the protected list page. */
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

/** Callers must check view_participants before reading registration totals. */
export async function getAdminDashboardOverview() {
  const db = getDb();
  const now = new Date();
  const [eventRows, registrationRows] = await Promise.all([
    db.select({
      id: events.id,
      title: events.title,
      startDate: events.startDate,
      endDate: events.endDate,
      publishStatus: events.publishStatus,
      registrationStatus: events.registrationStatus,
      isFeatured: events.isFeatured,
      capacity: events.capacity,
    }).from(events).orderBy(desc(events.startDate), asc(events.title)),
    db.select({
      eventId: registrations.eventId,
      total: count(),
      confirmed: count(sql`case when ${registrations.status} = 'confirmed' then 1 end`),
      awaiting: count(sql`case
        when ${registrations.status} = 'pending'
          and (${registrations.holdExpiresAt} is null or ${registrations.holdExpiresAt} > ${now})
        then 1
      end`),
    }).from(registrations).groupBy(registrations.eventId),
  ]);
  const countsByEvent = new Map(registrationRows.map((row) => [row.eventId, row]));
  const eventSummaries = eventRows.map((event) => {
    const counts = countsByEvent.get(event.id);
    const total = counts?.total ?? 0;
    const confirmed = counts?.confirmed ?? 0;
    const awaiting = counts?.awaiting ?? 0;
    return {
      ...event,
      total,
      confirmed,
      awaiting,
      lapsed: total - confirmed - awaiting,
      placesInUse: confirmed + awaiting,
    };
  });

  return {
    events: eventSummaries,
    totals: {
      eventCount: eventSummaries.length,
      openEventCount: eventSummaries.filter(
        (event) => event.publishStatus === "published" && event.registrationStatus === "open",
      ).length,
      totalRegistrations: eventSummaries.reduce((sum, event) => sum + event.total, 0),
      confirmed: eventSummaries.reduce((sum, event) => sum + event.confirmed, 0),
      awaiting: eventSummaries.reduce((sum, event) => sum + event.awaiting, 0),
      lapsed: eventSummaries.reduce((sum, event) => sum + event.lapsed, 0),
    },
  };
}

const participantsPerPage = 25;

/** Callers must check view_participants before reading this personal data. */
export async function getParticipantsPage(eventId: string, requestedPage: number) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) return null;

  const db = getDb();
  const [event, [totalRow]] = await Promise.all([
    db.query.events.findFirst({
      where: eq(events.id, eventId),
      columns: { id: true, title: true },
    }),
    db.select({ total: count() }).from(registrations).where(eq(registrations.eventId, eventId)),
  ]);
  if (!event) return null;

  const total = totalRow.total;
  const pageCount = Math.ceil(total / participantsPerPage);
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    Math.max(pageCount, 1),
  );
  const participants = await db.select({
    id: registrations.id,
    reference: registrations.reference,
    fullName: registrations.fullName,
    email: registrations.email,
    phone: registrations.phone,
    state: registrations.state,
    city: registrations.city,
    country: registrations.country,
    ticketName: registrations.ticketName,
    amountKobo: registrations.amountKobo,
    status: registrations.status,
    createdAt: registrations.createdAt,
    holdExpiresAt: registrations.holdExpiresAt,
  })
    .from(registrations)
    .where(eq(registrations.eventId, eventId))
    .orderBy(desc(registrations.createdAt), desc(registrations.id))
    .limit(participantsPerPage)
    .offset((page - 1) * participantsPerPage);

  return { event, participants, total, page, pageCount };
}
