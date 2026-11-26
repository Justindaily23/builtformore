import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { Container } from "@/components/ui/container";
import { brand } from "@/content/brand";
import { getEventListings } from "@/server/public/events";

export const dynamic = "force-dynamic";

const description = `Upcoming and past events from ${brand.name}.`;

export const metadata: Metadata = {
  title: "Events",
  description,
  alternates: { canonical: "/events" },
  openGraph: { title: `Events | ${brand.name}`, description, url: "/events", siteName: brand.name, type: "website" },
};

const grid = "mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3";

export default async function EventsPage() {
  const { upcoming, past } = await getEventListings();
  return (
    <>
      <header className="bg-plum py-12 text-ivory sm:py-16">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl">Events</h1>
          <p className="mt-3 max-w-xl text-lg text-ivory/85">See what is coming next and look back at past gatherings.</p>
        </Container>
      </header>
      <section aria-labelledby="upcoming" className="py-12 sm:py-16">
        <Container>
          <h2 id="upcoming" className="font-display text-3xl">Upcoming events</h2>
          {upcoming.length ? (
            <ul className={grid}>{upcoming.map((e) => <li key={e.slug}><EventCard event={e} /></li>)}</ul>
          ) : (
            <p className="mt-4 text-lg">New event details will be shared here.</p>
          )}
        </Container>
      </section>
      <section aria-labelledby="past" className="bg-rose-light py-12 sm:py-16">
        <Container>
          <h2 id="past" className="font-display text-3xl">Past events</h2>
          {past.length ? (
            <ul className={grid}>{past.map((e) => <li key={e.slug}><EventCard event={e} past /></li>)}</ul>
          ) : (
            <p className="mt-4 text-lg">Past events will appear here after they take place.</p>
          )}
        </Container>
      </section>
    </>
  );
}
