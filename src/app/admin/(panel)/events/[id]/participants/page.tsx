import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmBankTransferForm } from "@/components/admin/confirm-bank-transfer-form";
import { formatNaira } from "@/lib/money";
import { can } from "@/server/auth/permissions";
import { requirePermission } from "@/server/auth/session";
import { getParticipantsPage } from "@/server/events/queries";

export const metadata: Metadata = { title: "Event participants" };

const statusLabels = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  expired: "Expired",
  cancelled: "Cancelled",
} as const;

const statusStyles = {
  pending: "bg-gold-light",
  confirmed: "bg-plum text-ivory",
  expired: "bg-rose-light",
  cancelled: "border border-plum/30",
} as const;

function locationLabel(location: {
  city: string | null;
  state: string | null;
  country: string | null;
}) {
  const parts = [
    location.city,
    location.state === "Outside Nigeria" ? null : location.state,
    location.country === "Nigeria" ? null : location.country,
  ].filter((part): part is string => Boolean(part?.trim()));

  return parts.join(", ") || (location.state === "Outside Nigeria" ? "Outside Nigeria" : "Not provided");
}

function registeredAtLabel(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

async function Participants({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const admin = await requirePermission("view_participants");
  const canConfirmPayments = can(admin, "confirm_payments");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const requestedPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const result = await getParticipantsPage(id, requestedPage);
  if (!result) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/events/${result.event.id}`} className="mb-2 inline-block py-2 underline underline-offset-4">
          Back to event
        </Link>
        <h1 className="font-display text-3xl wrap-anywhere sm:text-4xl">Participants</h1>
        <p className="mt-2 wrap-anywhere">{result.event.title}</p>
        <p className="mt-1 text-sm">{result.total} registration{result.total === 1 ? "" : "s"}</p>
      </div>

      {result.participants.length === 0 ? (
        <p className="rounded-2xl border border-plum/15 bg-white p-5">No participants have registered for this event yet.</p>
      ) : (
        <ul className="space-y-3">
          {result.participants.map((participant) => (
            <li key={participant.id} className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold wrap-anywhere">{participant.fullName}</h2>
                  <p className="wrap-anywhere">{participant.email}</p>
                  <p>{participant.phone}</p>
                </div>
                <span className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[participant.status]}`}>
                  {statusLabels[participant.status]}
                </span>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-sm text-plum/75">Registration reference</dt>
                  <dd className="font-semibold wrap-anywhere">{participant.reference}</dd>
                </div>
                <div>
                  <dt className="text-sm text-plum/75">Location</dt>
                  <dd className="wrap-anywhere">{locationLabel(participant)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-plum/75">Ticket</dt>
                  <dd className="wrap-anywhere">{participant.ticketName} · {formatNaira(participant.amountKobo)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-plum/75">Registered</dt>
                  <dd>{registeredAtLabel(participant.createdAt)}</dd>
                </div>
              </dl>
              {participant.amountKobo > 0 &&
                (participant.status === "pending" || participant.status === "expired") && (
                  canConfirmPayments ? (
                    <details className="mt-4 rounded-xl border border-plum/20 p-4">
                      <summary className="cursor-pointer font-semibold">
                        Review bank transfer · {formatNaira(participant.amountKobo)}
                      </summary>
                      {participant.status === "expired" ||
                      (participant.holdExpiresAt !== null && participant.holdExpiresAt <= new Date()) ? (
                        <p className="mt-3 rounded-lg bg-gold-light p-3">
                          This registration hold has expired. Confirmation will only succeed if a place is still available.
                        </p>
                      ) : null}
                      <p className="mt-3">
                        Verify the full amount in the organisation’s bank account or statement. A transfer screenshot or participant-provided proof alone is not confirmation.
                      </p>
                      <ConfirmBankTransferForm eventId={result.event.id} registrationId={participant.id} />
                    </details>
                  ) : (
                    <p className="mt-4 text-sm">Payment confirmation is limited to the owner and staff authorized to confirm payments.</p>
                  )
                )}
            </li>
          ))}
        </ul>
      )}

      {result.pageCount > 1 && (
        <nav aria-label="Participant list pages" className="flex items-center justify-between gap-4">
          {result.page > 1 ? (
            <Link
              href={`/admin/events/${result.event.id}/participants?page=${result.page - 1}`}
              className="inline-flex min-h-11 items-center rounded-full border border-plum/50 px-5 font-semibold hover:bg-rose-light"
            >
              Previous
            </Link>
          ) : <span />}
          <p aria-live="polite">Page {result.page} of {result.pageCount}</p>
          {result.page < result.pageCount ? (
            <Link
              href={`/admin/events/${result.event.id}/participants?page=${result.page + 1}`}
              className="inline-flex min-h-11 items-center rounded-full border border-plum/50 px-5 font-semibold hover:bg-rose-light"
            >
              Next
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}

export default function EventParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={<p>Loading participants…</p>}>
        <Participants params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
