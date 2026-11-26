import Link from "next/link";
import { Suspense } from "react";
import { can, type Permission } from "@/server/auth/permissions";
import { requireAdmin } from "@/server/auth/session";

const access: { permission: Permission; label: string }[] = [
  { permission: "manage_events", label: "Manage events" },
  { permission: "view_participants", label: "View participants" },
  { permission: "confirm_payments", label: "Confirm payments" },
  { permission: "manage_admins", label: "Manage staff accounts" },
  { permission: "manage_payment_settings", label: "Change payment settings" },
];

async function Welcome() {
  const admin = await requireAdmin();
  return (
    <>
      <h1 className="font-display text-3xl wrap-anywhere sm:text-4xl">Welcome, {admin.name}</h1>
      <p className="mt-2 wrap-anywhere">
        Signed in as {admin.email} ({admin.role === "owner" ? "Owner" : "Staff"})
      </p>

      <section className="mt-8 rounded-2xl border border-plum/15 bg-white p-5 sm:p-8">
        <h2 className="font-display text-2xl">Your access</h2>
        <p className="mt-2">These tools are not built yet. This shows what your account will be allowed to do.</p>
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
