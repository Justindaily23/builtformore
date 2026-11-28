import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventHeading } from "@/components/admin/event-heading";
import { SpeakerManager } from "@/components/admin/speaker-manager";
import { requirePermission } from "@/server/auth/session";
import { uploadsAreSetUp } from "@/server/images/cloudinary";
import { getProgrammeForEdit, listSpeakerProfiles } from "@/server/programme/queries";

export const metadata: Metadata = { title: "Event speakers" };

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("manage_events");
  const event = await getProgrammeForEdit((await params).id);
  if (!event) notFound();
  const profiles = await listSpeakerProfiles();

  return (
    <div key={event.id} className="space-y-6">
      <EventHeading event={event} current="speakers" />
      <SpeakerManager
        eventId={event.id}
        profiles={profiles}
        uploadsReady={uploadsAreSetUp()}
        appearances={event.speakers.map((a) => ({
          id: a.id, role: a.role, sortOrder: a.sortOrder, isVisible: a.isVisible,
          name: a.speaker.name, professionalTitle: a.speaker.professionalTitle, bio: a.speaker.bio,
          photoUrl: a.speaker.photoUrl,
          shared: a.speaker.appearances.length > 1,
        }))}
      />
    </div>
  );
}

export default function EventSpeakersPage({ params }: PageProps<"/admin/events/[id]/speakers">) {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/events" className="mb-2 inline-block py-2 underline underline-offset-4">Back to events</Link>
      <Suspense fallback={<p>Loading speakers…</p>}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}
