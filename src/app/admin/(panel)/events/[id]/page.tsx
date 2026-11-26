import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badges } from "@/components/admin/badges";
import { EventForm } from "@/components/admin/event-form";
import { PaymentInstructions } from "@/components/admin/payment-instructions";
import { EventTabs } from "@/components/admin/event-tabs";
import { StatusPanel } from "@/components/admin/status-panel";
import { TicketManager } from "@/components/admin/ticket-manager";
import { privacyNotice } from "@/content/privacy";
import { toLocalInput } from "@/lib/datetime";
import { hasEnded } from "@/lib/event-dates";
import { can } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { getEventForEdit, getRegistrationCounts, type EditableEvent } from "@/server/events/queries";
import { setupProblems } from "@/server/registration/rules";
import { updateEventAction } from "../actions";

function warnings(event: EditableEvent): string[] {
  const list: string[] = [];
  if (event.days.some((d) => d.date < event.startDate || d.date > event.endDate)) {
    list.push("Some schedule days fall outside the event dates. The schedule stays hidden from visitors. Correct it on the Schedule tab.");
  }
  if (!event.tickets.some((t) => t.isActive)) list.push("There is no available ticket option.");
  if (event.capacity !== null && event.tickets.some((t) => (t.capacity ?? 0) > event.capacity!)) {
    list.push("A ticket has more places than the event's total. The total will still be the limit.");
  }
  return list;
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission("manage_events");
  const event = await getEventForEdit((await params).id);
  if (!event) notFound();
  const notes = warnings(event);
  const counts = await getRegistrationCounts(event.id);

  // The key keeps one event's form state from showing on another.
  return (
    <div key={event.id} className="space-y-6">
      <div>
        <h1 className="mb-3 font-display text-3xl wrap-anywhere sm:text-4xl">{event.title}</h1>
        <Badges event={event} />
        {event.publishStatus === "published" && (
          <Link href={`/events/${event.slug}`} target="_blank" className="mt-3 inline-block py-2 font-semibold underline underline-offset-4">
            View public page (new tab)
          </Link>
        )}
        {hasEnded(event) && (
          <p className="mt-2">This event has ended. If published, it is listed under Past events.</p>
        )}
      </div>
      <EventTabs eventId={event.id} current="details" />
      {notes.length > 0 && (
        <ul className="space-y-2 rounded-xl bg-gold-light p-4">
          {notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
      <StatusPanel
        eventId={event.id} publishStatus={event.publishStatus}
        isFeatured={event.isFeatured} registrationStatus={event.registrationStatus}
        openingProblems={setupProblems(event, event.tickets)} privacyApproved={privacyNotice.approved}
      />
      <section aria-labelledby="registrations-title" className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
        <h2 id="registrations-title" className="font-display text-2xl">Registrations</h2>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
          <div><dt className="text-sm">Awaiting payment</dt><dd className="text-2xl font-semibold">{counts.awaiting}</dd></div>
          <div><dt className="text-sm">Confirmed</dt><dd className="text-2xl font-semibold">{counts.confirmed}</dd></div>
          <div><dt className="text-sm">Lapsed or cancelled</dt><dd className="text-2xl font-semibold">{counts.lapsed}</dd></div>
        </dl>
        <p className="mt-3 text-sm">The participant list and payment confirmation come in the next step.</p>
      </section>
      <PaymentInstructions
        eventId={event.id} value={event.paymentInstructions} canEdit={can(admin, "manage_payment_settings")}
      />
      <TicketManager eventId={event.id} tickets={event.tickets.map(({ id, name, description, priceKobo, capacity, isActive, showPrice, sortOrder }) => ({
          id, name, description, priceKobo, capacity, isActive, showPrice, sortOrder,
        }))} />
      <div>
        <h2 className="mb-4 font-display text-3xl">Event details</h2>
        <EventForm
          action={updateEventAction.bind(null, event.id)}
          version={event.updatedAt.toISOString()}
          submitLabel="Save event details"
          values={{
            title: event.title, slug: event.slug, theme: event.theme, summary: event.summary,
            description: event.description, startDate: event.startDate, endDate: event.endDate,
            venue: event.venue, address: event.address, mapUrl: event.mapUrl, audience: event.audience,
            accessibilityNotes: event.accessibilityNotes, contactEmail: event.contactEmail,
            contactPhone: event.contactPhone, contactWhatsapp: event.contactWhatsapp, capacity: event.capacity,
            registrationDeadline: toLocalInput(event.registrationDeadline, event.timezone),
            onlineHoldMinutes: event.onlineHoldMinutes, transferHoldHours: event.transferHoldHours,
          }}
        />
      </div>
    </div>
  );
}

export default function EditEventPage({ params }: PageProps<"/admin/events/[id]">) {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/events" className="mb-2 inline-block py-2 underline underline-offset-4">Back to events</Link>
      <Suspense fallback={<p>Loading event…</p>}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}
