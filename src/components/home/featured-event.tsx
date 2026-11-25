import Image from "next/image";
import { Container } from "@/components/ui/container";
import { formatDateRange } from "@/lib/format";
import type { FeaturedEvent as Event, RegistrationStatus } from "@/types/content";

const statusText: Record<RegistrationStatus, string> = {
  coming_soon: "Registration opens soon",
  open: "Registration is open",
  closed: "Registration is closed",
};

export function FeaturedEvent({ event }: { event: Event | null }) {
  return (
    <section id="event" className="bg-rose-light py-16 sm:py-20 lg:py-28">
      <Container>
        {!event ? (
          <div className="max-w-xl">
            <h2 className="font-display text-4xl">The next gathering is on its way</h2>
            <p className="mt-4 text-lg">New event details will be shared here.</p>
          </div>
        ) : (
          <article className="grid overflow-hidden rounded-t-[10rem] bg-ivory sm:rounded-t-[14rem] lg:grid-cols-2 lg:rounded-tl-[18rem] lg:rounded-tr-none">
            <div className="relative aspect-[4/5] max-h-[28rem] w-full bg-rose lg:aspect-auto lg:max-h-none">
              {event.imageUrl ? (
                <Image src={event.imageUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                  <p className="font-semibold text-plum-950">Event photo coming soon</p>
                </div>
              )}
            </div>
            <div className="p-6 sm:p-10 lg:p-14">
              <p className="inline-block rounded-full bg-plum px-4 py-1.5 text-sm font-semibold text-ivory">
                {statusText[event.registrationStatus]}
              </p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-balance sm:text-4xl">{event.title}</h2>
              <p className="mt-3 text-xl font-semibold text-rose-deep">Theme: {event.theme}</p>
              <p className="mt-4 max-w-prose text-lg leading-relaxed">{event.summary}</p>
              <dl className="mt-8 grid gap-5 border-t border-plum/20 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-plum/70">Dates</dt>
                  <dd className="mt-1 font-semibold">{formatDateRange(event.startDate, event.endDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-plum/70">Convener</dt>
                  <dd className="mt-1 font-semibold">{event.convener}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-plum/70">Venue</dt>
                  <dd className="mt-1 font-semibold">
                    {event.venue}
                    <span className="block font-normal">{event.address}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        )}
      </Container>
    </section>
  );
}
