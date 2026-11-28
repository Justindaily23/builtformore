// What each role may do. This is the one place to change it.
export type AdminRole = "owner" | "staff";

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  canConfirmPayments: boolean;
};

const rules = {
  manage_events: () => true,
  // Website wording, contacts and the team on the About page.
  manage_content: () => true,
  view_participants: () => true,
  confirm_payments: (a: CurrentAdmin) => a.role === "owner" || a.canConfirmPayments,
  manage_admins: (a: CurrentAdmin) => a.role === "owner",
  manage_payment_settings: (a: CurrentAdmin) => a.role === "owner",
} satisfies Record<string, (admin: CurrentAdmin) => boolean>;

export type Permission = keyof typeof rules;

export function can(admin: CurrentAdmin, permission: Permission): boolean {
  return rules[permission](admin);
}
