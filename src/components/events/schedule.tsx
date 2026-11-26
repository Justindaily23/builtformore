import { formatDay, formatTimeRange } from "@/lib/time";
import type { getPublishedEvent } from "@/server/public/events";

type ScheduleData = NonNullable<NonNullable<Awaited<ReturnType<typeof getPublishedEvent>>>["schedule"]>;

// Each day opens and closes, so a long programme stays easy to scan on a phone.
// The first day starts open. This works without JavaScript.
export function Schedule({ note, days }: ScheduleData) {
  return (
    <>
      {note && <p className="mb-4 rounded-lg bg-gold-light p-3">{note}</p>}
      <div className="space-y-3">
        {days.map((day, index) => (
          <details key={day.date} open={index === 0} className="rounded-xl border border-plum/20 bg-white">
            <summary className="cursor-pointer p-4">
              <span className="font-semibold">{formatDay(day.date)}</span>
              {day.title && <span className="mt-1 block font-display text-xl">{day.title}</span>}
              {formatTimeRange(day.startTime, day.endTime) && (
                <span className="mt-1 block text-sm">{formatTimeRange(day.startTime, day.endTime)}</span>
              )}
            </summary>
            {day.sessions.length === 0 ? (
              <p className="border-t border-plum/15 p-4">Details to be announced.</p>
            ) : (
              <ol className="divide-y divide-plum/15 border-t border-plum/15 px-4">
                {day.sessions.map((session, i) => {
                  const time = formatTimeRange(session.startTime, session.endTime);
                  return (
                    <li key={i} className="py-4">
                      {time && <p className="text-sm font-semibold text-rose-deep">{time}</p>}
                      <h3 className="font-semibold">{session.title}</h3>
                      {session.location && <p className="text-sm">{session.location}</p>}
                      {session.description && <p className="mt-1 whitespace-pre-line">{session.description}</p>}
                      {session.people.length > 0 && <p className="mt-1">With {session.people.join(", ")}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </details>
        ))}
      </div>
    </>
  );
}
