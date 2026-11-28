// Everything the PUBLIC pages may read. Rules for visitors live here:
//  - only published events (drafts and archived events are never returned)
//  - only visible speakers, only available tickets
//  - a hidden price is removed here, so it never reaches the browser
// Columns are listed by name, so new private columns are not exposed by accident.
import "server-only";
import { and, asc, between, eq } from "drizzle-orm";
import { cache } from "react";
import { hasEnded } from "@/lib/event-dates";
import { currentRegistrationStatus } from "@/lib/registration-state";
import type { SpeakerRole } from "@/lib/speaker-roles";
import { getDb } from "@/server/db";
import { eventDays, events, eventSessions, eventSpeakers, ticketOptions } from "@/server/db/schema";
import { slugPattern } from "@/server/events/validation";

const cardColumns = {
  slug: true, title: true, theme: true, summary: true, startDate: true, endDate: true, timezone: true,
  venue: true, address: true, imageUrl: true, imageAlt: true, registrationStatus: true, registrationDeadline: true,
} as const;

const visibleSpeakers = {
  where: eq(eventSpeakers.isVisible, true),
  orderBy: [asc(eventSpeakers.sortOrder), asc(eventSpeakers.createdAt)],
  columns: { speakerId: true as const, role: true as const },
  with: { speaker: { columns: { name: true as const, professionalTitle: true as const, bio: true as const, photoUrl: true as const } } },
};

/** The home page event, or null. A finished event is no longer shown as the next one. */
export const getFeaturedEvent = cache(async () => {
  const event = await getDb().query.events.findFirst({
    where: and(eq(events.publishStatus, "published"), eq(events.isFeatured, true)),
    columns: cardColumns,
    with: { speakers: visibleSpeakers },
  });
  if (!event || hasEnded(event)) return null;
  const { speakers, ...rest } = event;
  return { ...rest, registrationStatus: currentRegistrationStatus(rest), convener: speakers.filter((s) => s.role === "convener").map((s) => s.speaker.name).join(", ") || null };
});

/** All published events, split into upcoming (soonest first) and past (newest first). */
export async function getEventListings() {
  const rows = await getDb().query.events.findMany({
    where: eq(events.publishStatus, "published"),
    columns: cardColumns,
    orderBy: [asc(events.startDate), asc(events.title)],
  });
  const list = rows.map((e) => ({ ...e, registrationStatus: currentRegistrationStatus(e) }));
  return {
    upcoming: list.filter((e) => !hasEnded(e)),
    past: list.filter((e) => hasEnded(e)).reverse(),
  };
}

type Appearance = {
  speakerId: string;
  role: SpeakerRole;
  speaker: { name: string; professionalTitle: string | null; bio: string | null; photoUrl: string | null };
};

/** One entry per person, even if they have two roles. */
function groupPeople(appearances: Appearance[]) {
  const people = new Map<string, Appearance["speaker"] & { key: string; roles: SpeakerRole[] }>();
  for (const { speakerId, role, speaker } of appearances) {
    const person = people.get(speakerId);
    if (person) person.roles.push(role);
    else people.set(speakerId, { ...speaker, key: String(people.size), roles: [role] });
  }
  return [...people.values()];
}

/** Only called when the admin has chosen to show the schedule. */
async function getVisibleSchedule(eventId: string, startDate: string, endDate: string) {
  const days = await getDb().query.eventDays.findMany({
    where: and(eq(eventDays.eventId, eventId), between(eventDays.date, startDate, endDate)),
    orderBy: [asc(eventDays.date)],
    columns: { date: true, title: true, startTime: true, endTime: true },
    with: {
      sessions: {
        where: eq(eventSessions.isVisible, true),
        orderBy: [asc(eventSessions.sortOrder), asc(eventSessions.startTime), asc(eventSessions.createdAt)],
        columns: { title: true, description: true, location: true, startTime: true, endTime: true },
        with: {
          speakers: {
            columns: {},
            with: { eventSpeaker: { columns: { isVisible: true, sortOrder: true }, with: { speaker: { columns: { name: true } } } } },
          },
        },
      },
    },
  });
  // Nothing to show if every session is private or deleted.
  if (!days.some((d) => d.sessions.length)) return [];
  return days.map(({ sessions, ...day }) => ({
    ...day,
    sessions: sessions.map(({ speakers, ...session }) => ({
      ...session,
      // Hidden people are removed here, on the server.
      people: [...new Set(
        speakers.map((s) => s.eventSpeaker).filter((s) => s.isVisible)
          .sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.speaker.name),
      )],
    })),
  }));
}

export const getPublishedEvent = cache(async (slug: string) => {
  if (slug.length > 80 || !slugPattern.test(slug)) return null;
  const event = await getDb().query.events.findFirst({
    where: and(eq(events.publishStatus, "published"), eq(events.slug, slug)),
    columns: {
      ...cardColumns,
      id: true, showSchedule: true, scheduleNote: true,
      description: true, mapUrl: true, audience: true, accessibilityNotes: true,
      contactEmail: true, contactPhone: true, contactWhatsapp: true,
    },
    with: {
      speakers: visibleSpeakers,
      tickets: {
        where: eq(ticketOptions.isActive, true),
        orderBy: [asc(ticketOptions.sortOrder), asc(ticketOptions.createdAt)],
        columns: { id: true, name: true, description: true, priceKobo: true, showPrice: true },
      },
    },
  });
  if (!event) return null;
  const ended = hasEnded(event);
  // Internal values are kept out of what the page receives.
  const { id, showSchedule, scheduleNote, speakers, ...rest } = event;
  // A hidden schedule is not even read from the database.
  const days = showSchedule ? await getVisibleSchedule(id, event.startDate, event.endDate) : [];
  return {
    ...rest,
    ended,
    people: groupPeople(speakers),
    schedule: days.length ? { note: scheduleNote, days } : null,
    // Past events do not list tickets or prices.
    tickets: ended
      ? []
      : event.tickets.map(({ showPrice, priceKobo, ...ticket }) => ({ ...ticket, priceKobo: showPrice ? priceKobo : null })),
  };
});

export type EventCardData = Awaited<ReturnType<typeof getEventListings>>["upcoming"][number];
