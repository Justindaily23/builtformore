import Link from "next/link";
import { Suspense } from "react";
import { Badges } from "@/components/admin/badges";
import { formatDateRange } from "@/lib/format";
import { requirePermission } from "@/server/auth/session";
import { listEvents } from "@/server/events/queries";

const groups = [
  { status: "published", title: "Published" },
  { status: "draft", title: "Drafts" },
  { status: "archived", title: "Archived" },
] as const;

async function EventList() {
  await requirePermission("manage_events");
  const events = await listEvents();

  if (events.length === 0) return <p className="mt-8">No events yet. Create your first one.</p>;

  return groups.map(({ status, title }) => {
    const rows = events.filter((e) => e.publishStatus === status);
    if (rows.length === 0) return null;
    return (
      <section key={status} className="mt-8">
        <h2 className="font-display text-2xl">{title} ({rows.length})</h2>
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {rows.map((event) => (
            <li key={event.id}>
              <Link href={`/admin/events/${event.id}`} className="block h-full rounded-2xl border border-plum/15 bg-white p-4 hover:border-plum/50 sm:p-5">
                <span className="block text-lg font-semibold wrap-anywhere">{event.title}</span>
                <span className="mt-1 mb-3 block wrap-anywhere">
                  {formatDateRange(event.startDate, event.endDate)}
                  {event.venue ? `, ${event.venue}` : ""}
                </span>
                <Badges event={event} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}

export default function EventsPage() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl sm:text-4xl">Events</h1>
        <Link href="/admin/events/new" className="inline-flex min-h-12 items-center justify-center rounded-full bg-plum px-6 font-semibold text-ivory hover:bg-plum-950">
          Create event
        </Link>
      </div>
      <p className="mt-3">Changes are saved here but do not appear on the public website yet.</p>
      <Suspense fallback={<p className="mt-8">Loading events…</p>}>
        <EventList />
      </Suspense>
    </>
  );
}
