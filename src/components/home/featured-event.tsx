import Link from "next/link";
import { EventPhoto } from "@/components/events/event-photo";
import { Container } from "@/components/ui/container";
import { formatDateRange } from "@/lib/format";
import { registrationText } from "@/lib/registration-text";
import type { getFeaturedEvent } from "@/server/public/events";

type Props = {
  event: Awaited<ReturnType<typeof getFeaturedEvent>>;
  /** True if the database could not be read. */
  unavailable?: boolean;
};

const moreLink = "inline-flex min-h-12 items-center font-semibold underline underline-offset-4";

export function FeaturedEvent({ event, unavailable }: Props) {
  return (
    <section id="event" className="bg-rose-light py-16 sm:py-20 lg:py-28">
      <Container>
        {!event ? (
          <div className="max-w-xl">
            <h2 className="font-display text-4xl">
              {unavailable ? "Event details are unavailable right now" : "The next gathering is on its way"}
            </h2>
            <p className="mt-4 text-lg">
              {unavailable ? "Please check back shortly." : "New event details will be shared here."}
            </p>
            {!unavailable && <Link href="/events" className={`mt-4 ${moreLink}`}>See all events</Link>}
          </div>
        ) : (
          <article className="grid overflow-hidden rounded-t-[10rem] bg-ivory sm:rounded-t-[14rem] lg:grid-cols-2 lg:rounded-tl-[18rem] lg:rounded-tr-none">
            <div className="relative aspect-[4/5] max-h-[28rem] w-full bg-rose lg:aspect-auto lg:max-h-none">
              <EventPhoto url={event.imageUrl} alt={event.imageAlt} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div className="p-6 sm:p-10 lg:p-14">
              <p className="inline-block rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-ivory">
                {registrationText[event.registrationStatus]}
              </p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-balance sm:text-4xl">{event.title}</h2>
              {event.theme && <p className="mt-3 text-xl font-semibold text-rose-deep">Theme: {event.theme}</p>}
              <p className="mt-4 max-w-prose text-lg leading-relaxed">{event.summary}</p>
              <dl className="mt-8 grid gap-5 border-t border-plum/20 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-plum/70">Dates</dt>
                  <dd className="mt-1 font-semibold">{formatDateRange(event.startDate, event.endDate)}</dd>
                </div>
                {event.convener && (
                  <div>
                    <dt className="text-sm text-plum/70">Convener</dt>
                    <dd className="mt-1 font-semibold">{event.convener}</dd>
                  </div>
                )}
                {(event.venue || event.address) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-plum/70">Venue</dt>
                    <dd className="mt-1 font-semibold">
                      {event.venue}
                      {event.address && <span className="block font-normal">{event.address}</span>}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-8 flex flex-col items-start gap-x-6 gap-y-2 sm:flex-row sm:items-center">
                {event.registrationStatus === "open" && (
                  <Link href={`/events/${event.slug}/register`} className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 font-semibold text-plum-950 hover:bg-gold-light">
                    Register
                  </Link>
                )}
                <Link href={`/events/${event.slug}`} className="inline-flex min-h-12 items-center rounded-full bg-plum px-7 font-semibold text-ivory hover:bg-plum-950">
                  View event details
                </Link>
                <Link href="/events" className={moreLink}>All events</Link>
              </div>
            </div>
          </article>
        )}
      </Container>
    </section>
  );
}
