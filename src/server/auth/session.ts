// THE security check. Call requireAdmin() or requirePermission() inside every
// admin page, Server Action and Route Handler. A check in a layout, or hiding a
// button, does not protect anything on its own.
import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/server/db";
import { adminUsers } from "@/server/db/schema";
import { getAuth } from "./auth";
import { can, type CurrentAdmin, type Permission } from "./permissions";

/** The signed-in admin, or null. Looked up at most once per request. */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  // Read the request first: this marks the page as needing a live request.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;

  // Read role and status fresh, so changes apply immediately.
  const [admin] = await getDb()
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      canConfirmPayments: adminUsers.canConfirmPayments,
      isActive: adminUsers.isActive,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.user.id));

  if (!admin?.isActive) return null;
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    canConfirmPayments: admin.canConfirmPayments,
  };
});

export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requirePermission(permission: Permission): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (!can(admin, permission)) throw new Error("You do not have permission to do this.");
  return admin;
}
