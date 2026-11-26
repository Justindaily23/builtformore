// Reads the database and prints a short summary. Changes nothing.
import { loadEnvConfig } from "@next/env";
import { createDb } from "../src/server/db/client";

loadEnvConfig(process.cwd(), true);

async function main() {
  const { db, pool } = createDb(process.env.DATABASE_URL);
  try {
    const brand = await db.query.brandSettings.findFirst();
    console.log("Brand:", brand?.name ?? "none");

    const list = await db.query.events.findMany({
      with: {
        tickets: { orderBy: (t, { asc }) => asc(t.sortOrder) },
        speakers: { with: { speaker: true } },
        days: { with: { sessions: true } },
      },
    });
    console.log("Events:", list.length);

    for (const e of list) {
      console.log(`\n${e.title} (/${e.slug})`);
      console.log(`  ${e.publishStatus}, registration: ${e.registrationStatus}, capacity: ${e.capacity ?? "no limit"}`);
      for (const t of e.tickets) {
        const price = `NGN ${(t.priceKobo / 100).toLocaleString("en-NG")}`;
        console.log(`  Ticket: ${t.name}, ${price}, places: ${t.capacity ?? "no separate limit"}`);
      }
      console.log(`  Speakers: ${e.speakers.map((s) => `${s.speaker.name} (${s.role})`).join(", ") || "none"}`);
      const sessions = e.days.reduce((n, d) => n + d.sessions.length, 0);
      console.log(`  Schedule: ${e.days.length} days, ${sessions} sessions, shown to public: ${e.showSchedule}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
