import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { adminRole } from "./enums";

/**
 * Who may use the admin panel, and what they may do. This is also Better Auth's
 * "user" table. Passwords and sessions are in auth.ts.
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: id(),
    name: text("name").notNull(),
    /** Always stored in lowercase. */
    email: text("email").notNull(),
    // Required by Better Auth.
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: adminRole("role").notNull().default("staff"),
    /** For staff. Owners can always confirm payments. */
    canConfirmPayments: boolean("can_confirm_payments").notNull().default(false),
    // Deactivate instead of deleting, so the activity history stays complete.
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("admin_users_email_unique").on(sql`lower(${t.email})`)],
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: id(),
    /** Null for actions done by the system, e.g. a Paystack notification. */
    adminId: uuid("admin_id").references(() => adminUsers.id, { onDelete: "restrict" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    /** What changed. Do not copy participants' personal details in here. */
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("activity_log_entity_idx").on(t.entityType, t.entityId),
    index("activity_log_created_idx").on(t.createdAt),
  ],
);
