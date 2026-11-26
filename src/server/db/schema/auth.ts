// Tables used by Better Auth. The property names must match what it expects.
import { bigint, index, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { adminUsers } from "./admin";

const when = (name: string) => timestamp(name, { withTimezone: true });
const userId = () => uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" });

/** One row per signed-in device. */
export const authSessions = pgTable(
  "auth_sessions",
  {
    id: id(),
    userId: userId(),
    token: text("token").notNull().unique(),
    expiresAt: when("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("auth_sessions_user_idx").on(t.userId)],
);

/** Sign-in methods. For email and password, "password" holds a hash. */
export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: id(),
    userId: userId(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    password: text("password"),
    // Unused with email and password, but part of Better Auth's table.
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: when("access_token_expires_at"),
    refreshTokenExpiresAt: when("refresh_token_expires_at"),
    scope: text("scope"),
    ...timestamps,
  },
  (t) => [
    index("auth_accounts_user_idx").on(t.userId),
    unique("auth_accounts_provider_account").on(t.providerId, t.accountId),
  ],
);

export const authVerifications = pgTable(
  "auth_verifications",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: when("expires_at").notNull(),
    ...timestamps,
  },
  (t) => [index("auth_verifications_identifier_idx").on(t.identifier)],
);

/** Counts recent sign-in attempts. */
export const authRateLimits = pgTable("auth_rate_limits", {
  id: id(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
