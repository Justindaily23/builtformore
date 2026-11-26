import { sql } from "drizzle-orm";
import {
  bigint, boolean, check, foreignKey, index, integer, jsonb, pgTable, text, timestamp, unique, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { adminUsers } from "./admin";
import { paymentMethod, paymentStatus, registrationStatus } from "./enums";
import { events, ticketOptions } from "./events";

const when = (name: string) => timestamp(name, { withTimezone: true });

export const registrations = pgTable(
  "registrations",
  {
    id: id(),
    /** Short code the participant can quote. Must be hard to guess, but is not a password. */
    reference: text("reference").notNull().unique(),
    // "restrict": an event or ticket with registrations cannot be deleted. Archive it.
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "restrict" }),
    ticketOptionId: uuid("ticket_option_id").notNull(),

    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),

    // Copied at registration, so later ticket edits do not change them.
    ticketName: text("ticket_name").notNull(),
    amountKobo: bigint("amount_kobo", { mode: "number" }).notNull(),

    status: registrationStatus("status").notNull().default("pending"),
    holdExpiresAt: when("hold_expires_at"),
    confirmedAt: when("confirmed_at"),

    privacyConsentAt: when("privacy_consent_at").notNull(),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    /** Optional and separate. Null means no marketing consent. */
    marketingConsentAt: when("marketing_consent_at"),
    /** Set if the event asks people to confirm they are 18 or over. */
    ageConfirmedAt: when("age_confirmed_at"),
    ...timestamps,
  },
  (t) => [
    // The ticket must belong to the same event.
    foreignKey({
      name: "registrations_ticket_fk",
      columns: [t.eventId, t.ticketOptionId],
      foreignColumns: [ticketOptions.eventId, ticketOptions.id],
    }).onDelete("restrict"),
    // One active registration per email per event.
    uniqueIndex("registrations_one_active_per_email")
      .on(t.eventId, sql`lower(${t.email})`)
      .where(sql`${t.status} in ('pending', 'confirmed')`),
    index("registrations_event_status_idx").on(t.eventId, t.status),
    index("registrations_ticket_status_idx").on(t.ticketOptionId, t.status),
    check("registrations_amount_not_negative", sql`${t.amountKobo} >= 0`),
    check("registrations_confirmed_has_date", sql`${t.status} <> 'confirmed' or ${t.confirmedAt} is not null`),
  ],
);

/** One row per payment attempt, so a registration can have several. */
export const payments = pgTable(
  "payments",
  {
    id: id(),
    registrationId: uuid("registration_id").notNull().references(() => registrations.id, { onDelete: "restrict" }),
    method: paymentMethod("method").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    /** Expected amount while pending; the amount actually received once successful. */
    amountKobo: bigint("amount_kobo", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("NGN"),
    /** Our unique reference for this attempt (sent to Paystack). */
    reference: text("reference").notNull().unique(),
    providerTransactionId: text("provider_transaction_id").unique(),
    /** e.g. "card" or "bank_transfer", as reported by Paystack. */
    channel: text("channel"),

    // Manual bank transfer confirmation.
    bankReference: text("bank_reference").unique(),
    note: text("note"),
    confirmedByAdminId: uuid("confirmed_by_admin_id").references(() => adminUsers.id, { onDelete: "restrict" }),

    paidAt: when("paid_at"),
    // For late, duplicate or wrong-amount payments that a person must check.
    needsReview: boolean("needs_review").notNull().default(false),
    reviewReason: text("review_reason"),
    ...timestamps,
  },
  (t) => [
    index("payments_registration_idx").on(t.registrationId),
    index("payments_review_idx").on(t.needsReview).where(sql`${t.needsReview}`),
    check("payments_amount_positive", sql`${t.amountKobo} > 0`),
    check("payments_currency_ngn", sql`${t.currency} = 'NGN'`),
    check("payments_success_has_date", sql`${t.status} <> 'successful' or ${t.paidAt} is not null`),
    // A manual confirmation must say who confirmed it, with what proof.
    check(
      "payments_manual_proof",
      sql`${t.method} <> 'bank_transfer' or ${t.status} <> 'successful' or (
        ${t.confirmedByAdminId} is not null
        and coalesce(trim(${t.bankReference}), '') <> ''
        and coalesce(trim(${t.note}), '') <> ''
      )`,
    ),
    check("payments_review_has_reason", sql`not ${t.needsReview} or ${t.reviewReason} is not null`),
  ],
);

/** Slows down repeated public form submissions. */
export const formRateLimits = pgTable("form_rate_limits", {
  /** A scrambled form of the sender's network address, never the address itself. */
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: when("window_start").notNull(),
});

/** Paystack notifications already received, so repeats are handled once. */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: id(),
    provider: text("provider").notNull().default("paystack"),
    eventType: text("event_type").notNull(),
    /** The identifier that makes this notification unique for its type. */
    eventKey: text("event_key").notNull(),
    /** Small, non-personal facts only. Do not store the whole message. */
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    receivedAt: when("received_at").notNull().defaultNow(),
    /** Null means it has not been processed successfully yet. */
    processedAt: when("processed_at"),
  },
  (t) => [unique("webhook_events_unique").on(t.provider, t.eventType, t.eventKey)],
);
