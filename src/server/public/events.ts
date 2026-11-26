// Everything the PUBLIC pages may read. Rules for visitors live here:
//  - only published events (drafts and archived events are never returned)
//  - only visible speakers, only available tickets
//  - a hidden price is removed here, so it never reaches the browser
// Columns are listed by name, so new private columns are not exposed by accident.
import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";
import { hasEnded } from "@/lib/event-dates";
import { getDb } from "@/server/db";
import { events, eventSpeakers, ticketOptions } from "@/server/db/schema";
import { slugPattern } from "@/server/events/validation";

const cardColumns = {
  slug: true, title: true, theme: true, summary: true, startDate: true, endDate: true, timezone: true,
  venue: true, address: true, imageUrl: true, imageAlt: true, registrationStatus: true,
} as const;

const visibleSpeakers = {
  where: eq(eventSpeakers.isVisible, true),
  orderBy: [asc(eventSpeakers.sortOrder), asc(eventSpeakers.createdAt)],
  columns: { role: true as const },
  with: { speaker: { columns: { name: true as const, professionalTitle: true as const } } },
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
  return { ...rest, convener: speakers.filter((s) => s.role === "convener").map((s) => s.speaker.name).join(", ") || null };
});

/** All published events, split into upcoming (soonest first) and past (newest first). */
export async function getEventListings() {
  const rows = await getDb().query.events.findMany({
    where: eq(events.publishStatus, "published"),
    columns: cardColumns,
    orderBy: [asc(events.startDate), asc(events.title)],
  });
  return {
    upcoming: rows.filter((e) => !hasEnded(e)),
    past: rows.filter((e) => hasEnded(e)).reverse(),
  };
}

export const getPublishedEvent = cache(async (slug: string) => {
  if (slug.length > 80 || !slugPattern.test(slug)) return null;
  const event = await getDb().query.events.findFirst({
    where: and(eq(events.publishStatus, "published"), eq(events.slug, slug)),
    columns: {
      ...cardColumns,
      description: true, mapUrl: true, audience: true, accessibilityNotes: true,
      contactEmail: true, contactPhone: true, contactWhatsapp: true, registrationDeadline: true,
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
  return {
    ...event,
    ended,
    // Past events do not list tickets or prices.
    tickets: ended
      ? []
      : event.tickets.map(({ showPrice, priceKobo, ...ticket }) => ({ ...ticket, priceKobo: showPrice ? priceKobo : null })),
  };
});

export type EventCardData = Awaited<ReturnType<typeof getEventListings>>["upcoming"][number];
