import Link from "next/link";
import { EventPhoto } from "@/components/events/event-photo";
import { formatDateRange } from "@/lib/format";
import { isShowableImage } from "@/lib/images";
import { registrationText } from "@/lib/registration-text";
import type { EventCardData } from "@/server/public/events";

export function EventCard({ event, past = false }: { event: EventCardData; past?: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={`flex h-full flex-col rounded-t-[3rem] border-t-4 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${past ? "border-rose" : "border-gold"}`}
    >
      {isShowableImage(event.imageUrl) && (
        <div className="relative mt-4 mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-rose-light">
          {/* Empty description: the title below already names the link. */}
          <EventPhoto url={event.imageUrl} alt="" sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        </div>
      )}
      <p className="font-semibold text-rose-deep">{formatDateRange(event.startDate, event.endDate)}</p>
      <h3 className="mt-2 font-display text-2xl leading-snug wrap-anywhere">{event.title}</h3>
      {event.venue && <p className="mt-2 wrap-anywhere">{event.venue}</p>}
      <p className="mt-3 leading-relaxed wrap-anywhere">{event.summary}</p>
      <p className="mt-auto pt-5 text-sm font-semibold">
        {past ? "Past event" : registrationText[event.registrationStatus]}
      </p>
    </Link>
  );
}
