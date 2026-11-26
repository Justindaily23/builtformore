"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteTicketAction, saveTicketAction } from "@/app/admin/(panel)/events/actions";
import { emptyState } from "@/lib/form-state";
import { formatNaira, koboToInput } from "@/lib/money";
import { Check, Field, Message, keepValues, primaryButton, secondaryButton } from "./form-parts";

export type Ticket = {
  id: string;
  name: string;
  description: string | null;
  priceKobo: number;
  capacity: number | null;
  isActive: boolean;
  showPrice: boolean;
  sortOrder: number;
};

function TicketForm({ eventId, ticket, nextOrder }: { eventId: string; ticket?: Ticket; nextOrder: number }) {
  const [state, action, pending] = useActionState(saveTicketAction.bind(null, eventId, ticket?.id ?? null), emptyState);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const idPrefix = ticket?.id ?? "new";
  const shared = { errors: state.errors, idPrefix };

  function remove() {
    if (!ticket || !window.confirm(`Delete the ticket "${ticket.name}"? This cannot be undone.`)) return;
    setDeleteError("");
    startDelete(async () => {
      try {
        const result = await deleteTicketAction(eventId, ticket.id);
        if (!result.ok) setDeleteError(result.message);
      } catch {
        setDeleteError("We couldn't reach the server. Please try again.");
      }
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Field {...shared} label="Ticket name" name="name" required defaultValue={ticket?.name} />
        <Field {...shared} label="Price (₦)" name="price" inputMode="decimal" required
          defaultValue={ticket ? koboToInput(ticket.priceKobo) : ""} hint="In naira. Use 0 for a free ticket." />
        <Field {...shared} className="md:col-span-2" label="Description" name="description" rows={2} defaultValue={ticket?.description} />
        <Field {...shared} label="Places for this ticket" name="capacity" inputMode="numeric" defaultValue={ticket?.capacity}
          hint="e.g. accommodation places. Blank means no separate limit." />
        <Field key={ticket ? "saved" : nextOrder} {...shared} label="Display order" name="sortOrder" inputMode="numeric" required
          defaultValue={ticket?.sortOrder ?? nextOrder} hint="Lower numbers appear first." />
        <Check name="isActive" label="Available" hint="Turn off to stop offering this ticket." checked={ticket?.isActive ?? true} />
        <Check name="showPrice" label="Show price to visitors" hint="Tick only when the price is approved." checked={ticket?.showPrice ?? false} />
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
          <button type="submit" disabled={pending || deleting} className={primaryButton}>
            {pending ? "Saving…" : ticket ? "Save ticket" : "Add ticket"}
          </button>
          {ticket && (
            <button type="button" onClick={remove} disabled={pending || deleting} className={secondaryButton}>
              {deleting ? "Deleting…" : "Delete ticket"}
            </button>
          )}
        </div>
      </form>
      <Message state={state} />
      <Message state={{ message: deleteError }} />
    </div>
  );
}

export function TicketManager({ eventId, tickets }: { eventId: string; tickets: Ticket[] }) {
  const nextOrder = Math.min(999, Math.max(0, ...tickets.map((t) => t.sortOrder)) + 1);
  const box = "rounded-xl border border-plum/20 p-4";

  return (
    <section aria-labelledby="tickets-title" className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
      <h2 id="tickets-title" className="font-display text-2xl">Ticket options</h2>
      <p className="mt-1 text-sm">Price changes apply to new registrations only.</p>

      <ul className="mt-4 space-y-3">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <details className={box}>
              <summary className="cursor-pointer py-1">
                <span className="font-semibold wrap-anywhere">{ticket.name}</span>
                <span className="mt-1 block text-sm">
                  {ticket.priceKobo === 0 ? "Free" : formatNaira(ticket.priceKobo)}
                  {ticket.capacity ? `, ${ticket.capacity} places` : ", no separate limit"}
                  {ticket.isActive ? "" : ", turned off"}
                  {ticket.showPrice ? ", price shown" : ", price hidden"}
                </span>
              </summary>
              <TicketForm eventId={eventId} ticket={ticket} nextOrder={nextOrder} />
            </details>
          </li>
        ))}
      </ul>
      {tickets.length === 0 && <p className="mt-4">No ticket options yet. Add one below.</p>}

      <details className={`${box} mt-3 border-dashed`}>
        <summary className="cursor-pointer py-1 font-semibold">Add a ticket option</summary>
        <TicketForm eventId={eventId} nextOrder={nextOrder} />
      </details>
    </section>
  );
}
