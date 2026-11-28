import Link from "next/link";
import { Suspense } from "react";
import { can, type Permission } from "@/server/auth/permissions";
import { requireAdmin } from "@/server/auth/session";
import { getAdminDashboardOverview } from "@/server/events/queries";
import { Badges } from "@/components/admin/badges";
import { formatDateRange } from "@/lib/format";

const access: { permission: Permission; label: string }[] = [
  { permission: "manage_events", label: "Manage events" },
  { permission: "manage_content", label: "Edit website wording and team" },
  { permission: "view_participants", label: "View participants" },
  { permission: "confirm_payments", label: "Confirm payments" },
  { permission: "manage_admins", label: "Manage staff accounts" },
  { permission: "manage_payment_settings", label: "Change payment settings" },
];

async function Welcome() {
  const admin = await requireAdmin();
  const dashboard = can(admin, "view_participants") ? await getAdminDashboardOverview() : null;
  return (
    <>
      <h1 className="font-display text-3xl wrap-anywhere sm:text-4xl">Dashboard</h1>
      <p className="mt-2">Welcome, {admin.name}</p>
      <p className="mt-2 wrap-anywhere">
        Signed in as {admin.email} ({admin.role === "owner" ? "Owner" : "Staff"})
      </p>

      {can(admin, "manage_events") && (
        <Link href="/admin/events" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-plum px-6 font-semibold text-ivory hover:bg-plum-950">
          Manage events
        </Link>
      )}

      {dashboard && (
        <section aria-labelledby="overview-title" className="mt-8">
          <h2 id="overview-title" className="font-display text-2xl">Registration overview</h2>
          <p className="mt-1">Current registrations across all events. Expired holds no longer count as places in use.</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Events", value: dashboard.totals.eventCount },
              { label: "Published and marked open", value: dashboard.totals.openEventCount },
              { label: "Awaiting payment", value: dashboard.totals.awaiting },
              { label: "Confirmed", value: dashboard.totals.confirmed },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-plum/15 bg-white p-4">
                <dt className="text-sm text-plum/75">{label}</dt>
                <dd className="mt-1 font-display text-3xl">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm">All registrations: {dashboard.totals.totalRegistrations}. Expired or cancelled: {dashboard.totals.lapsed}.</p>

          {dashboard.events.length > 0 ? (
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {dashboard.events.map((event) => (
                <li key={event.id} className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-5">
                  <h3 className="font-semibold wrap-anywhere">{event.title}</h3>
                  <p className="mt-1 text-sm">{formatDateRange(event.startDate, event.endDate)}</p>
                  <div className="mt-3"><Badges event={event} /></div>
                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-sm text-plum/75">Awaiting payment</dt>
                      <dd className="text-xl font-semibold">{event.awaiting}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-plum/75">Confirmed</dt>
                      <dd className="text-xl font-semibold">{event.confirmed}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-plum/75">Expired or cancelled</dt>
                      <dd className="text-xl font-semibold">{event.lapsed}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-plum/75">Places in use</dt>
                      <dd className="text-xl font-semibold">
                        {event.placesInUse}{event.capacity === null ? " · no overall limit" : ` / ${event.capacity}`}
                      </dd>
                    </div>
                  </dl>
                  {can(admin, "view_participants") && (
                    <Link
                      href={`/admin/events/${event.id}/participants`}
                      className="mt-4 inline-block min-h-11 py-2 font-semibold underline underline-offset-4"
                    >
                      View participants and payments
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-plum/15 bg-white p-5">No events yet. Create an event to see its registration activity here.</p>
          )}
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-plum/15 bg-white p-5 sm:p-8">
        <h2 className="font-display text-2xl">Your access</h2>
        <p className="mt-2">Manage events and website content, view participants, and confirm verified bank transfers. Staff-account management and other launch tools are still to come.</p>
        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {access.map(({ permission, label }) => (
            <li key={permission} className="flex justify-between gap-4 border-t border-plum/15 py-3">
              <span>{label}</span>
              <span className="shrink-0 font-semibold">{can(admin, permission) ? "Allowed" : "Not allowed"}</span>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/" className="mt-6 inline-block py-3 underline underline-offset-4">
        View the website
      </Link>
    </>
  );
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<p>Checking your login…</p>}>
      <Welcome />
    </Suspense>
  );
}
