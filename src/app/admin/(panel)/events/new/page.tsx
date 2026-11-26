import Link from "next/link";
import { Suspense } from "react";
import { NewEventForm } from "@/components/admin/new-event-form";
import { requirePermission } from "@/server/auth/session";

async function Guarded() {
  await requirePermission("manage_events");
  return <NewEventForm />;
}

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/events" className="inline-block py-2 underline underline-offset-4">Back to events</Link>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Create event</h1>
      <p className="mt-2 mb-6">It starts as a hidden draft. You can add ticket options after creating it.</p>
      <Suspense fallback={<p>Loading…</p>}>
        <Guarded />
      </Suspense>
    </div>
  );
}
