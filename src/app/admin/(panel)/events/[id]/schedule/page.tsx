import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventHeading } from "@/components/admin/event-heading";
import { ScheduleManager } from "@/components/admin/schedule-manager";
import { roleNames } from "@/lib/speaker-roles";
import { requirePermission } from "@/server/auth/session";
import { getProgrammeForEdit } from "@/server/programme/queries";

export const metadata: Metadata = { title: "Event schedule" };

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("manage_events");
  const event = await getProgrammeForEdit((await params).id);
  if (!event) notFound();

  return (
    <div key={event.id} className="space-y-6">
      <EventHeading event={event} current="schedule" />
      <ScheduleManager
        event={{
          id: event.id, startDate: event.startDate, endDate: event.endDate,
          showSchedule: event.showSchedule, scheduleNote: event.scheduleNote,
        }}
        people={event.speakers.map((a) => ({
          id: a.id,
          label: `${a.speaker.name} (${roleNames[a.role]}${a.isVisible ? "" : ", hidden"})`,
        }))}
        days={event.days.map((d) => ({
          id: d.id, date: d.date, title: d.title, startTime: d.startTime, endTime: d.endTime,
          sessions: d.sessions.map((s) => ({
            id: s.id, title: s.title, description: s.description, location: s.location,
            startTime: s.startTime, endTime: s.endTime, sortOrder: s.sortOrder, isVisible: s.isVisible,
            speakerIds: s.speakers.map((p) => p.eventSpeakerId),
          })),
        }))}
      />
    </div>
  );
}

export default function EventSchedulePage({ params }: PageProps<"/admin/events/[id]/schedule">) {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/events" className="mb-2 inline-block py-2 underline underline-offset-4">Back to events</Link>
      <Suspense fallback={<p>Loading schedule…</p>}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}
