// Adds sample data. Safe to run again: if data exists, it is left unchanged.
import { loadEnvConfig } from "@next/env";
import { brand } from "../src/content/brand";
import { featuredEvent } from "../src/content/featured-event";
import { createDb } from "../src/server/db/client";
import {
  brandSettings, eventDays, eventSessions, events, eventSpeakers, speakers, ticketOptions,
} from "../src/server/db/schema";

loadEnvConfig(process.cwd(), true);

// Adapted from the proposal's PROPOSED four-day programme to three days. It is
// NOT approved. Sessions have no individual times.
// The unconfirmed guest speaker is deliberately left out.
const programme = [
  {
    date: "2027-11-25", title: "The Awakening", startTime: "14:00", endTime: "19:00",
    sessions: [
      "Registration, welcome refreshments and networking",
      "Opening ceremony and welcome address",
      "Conference vision and theme presentation: Becoming More",
      "Opening keynote",
      "Women of influence panel and networking reception",
    ],
  },
  {
    date: "2027-11-26", title: "The Equipping", startTime: "09:00", endTime: "17:30",
    sessions: [
      "Morning inspiration and leadership charge",
      "Executive leadership and decision-making masterclass",
      "Women in business: innovation, entrepreneurship and scaling",
      "Lunch and structured networking",
      "Financial intelligence, wealth creation and legacy building",
      "Mentorship conversations with accomplished leaders",
    ],
  },
  {
    date: "2027-11-27", title: "The Deployment", startTime: "09:00", endTime: "14:00",
    sessions: [
      "Morning reflection and leadership inspiration",
      "Practical action-planning workshop",
      "The next generation of women leaders: a special dialogue",
      "Commitments, commissioning and recognition awards",
      "Closing keynote and remarks",
    ],
  },
];

const naira = (amount: number) => amount * 100; // to kobo

async function main() {
  const sample = featuredEvent;
  if (!sample) throw new Error("src/content/featured-event.ts has no event to seed.");
  const { db, pool } = createDb(process.env.DATABASE_URL);

  try {
    // One transaction: either everything is added, or nothing is.
    await db.transaction(async (tx) => {
      const { contact, ...brandText } = brand;
      // "coming soon" placeholder contacts are stored as empty.
      await tx
        .insert(brandSettings)
        .values({ id: 1, ...brandText, location: contact.location })
        .onConflictDoNothing();

      const [existing] = await tx.select({ id: events.id }).from(events).limit(1);
      if (existing) {
        console.log("Sample event not added: this database already has events.");
        return;
      }

      const [event] = await tx
        .insert(events)
        .values({
          slug: "bfm-conference-2027",
          title: sample.title,
          theme: sample.theme,
          summary: sample.summary,
          startDate: sample.startDate,
          endDate: sample.endDate,
          venue: sample.venue,
          address: sample.address,
          audience:
            "Women aged 25 and above from diverse backgrounds, professions, industries and stages of life.",
          publishStatus: "published",
          registrationStatus: "coming_soon",
          capacity: 200,
          isFeatured: true,
          showSchedule: false,
          scheduleNote: "Proposed programme. Sessions and times may change.",
        })
        .onConflictDoNothing()
        .returning({ id: events.id });

      if (!event) {
        console.log("Sample data not added: the event or a featured event already exists.");
        return;
      }

      // PLACEHOLDER prices, hidden from the public until approved.
      await tx.insert(ticketOptions).values([
        { eventId: event.id, name: "Conference only", priceKobo: naira(200_000), sortOrder: 1 },
        {
          eventId: event.id, name: "Conference + Accommodation", priceKobo: naira(600_000),
          capacity: 60, sortOrder: 2,
        },
      ]);

      const [convener] = await tx
        .insert(speakers)
        .values({ name: sample.convener })
        .returning({ id: speakers.id });
      // Visible to match the home page. Confirm permission before launch.
      await tx
        .insert(eventSpeakers)
        .values({ eventId: event.id, speakerId: convener.id, role: "convener", isVisible: true });

      for (const { sessions, ...day } of programme) {
        const [row] = await tx
          .insert(eventDays)
          .values({ eventId: event.id, ...day })
          .returning({ id: eventDays.id });
        await tx.insert(eventSessions).values(
          sessions.map((title, i) => ({ eventId: event.id, dayId: row.id, title, sortOrder: i + 1 })),
        );
      }
      console.log("Sample data added.");
    });
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
