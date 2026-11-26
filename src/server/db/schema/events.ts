import { sql } from "drizzle-orm";
import {
  bigint, boolean, check, date, index, integer, pgTable, text, timestamp, unique, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { publishStatus, registrationWindow } from "./enums";

export const events = pgTable(
  "events",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    theme: text("theme"),
    summary: text("summary").notNull(),
    description: text("description"),

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    /** Daily times live on event_days, in this timezone. */
    timezone: text("timezone").notNull().default("Africa/Lagos"),

    venue: text("venue"),
    address: text("address"),
    mapUrl: text("map_url"),
    audience: text("audience"),
    accessibilityNotes: text("accessibility_notes"),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),

    // Optional per-event contacts. Null means "use the brand's contacts".
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    contactWhatsapp: text("contact_whatsapp"),

    publishStatus: publishStatus("publish_status").notNull().default("draft"),
    registrationStatus: registrationWindow("registration_status").notNull().default("coming_soon"),
    registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
    /** Total places. Null means no limit. */
    capacity: integer("capacity"),
    isFeatured: boolean("is_featured").notNull().default(false),

    showSchedule: boolean("show_schedule").notNull().default(false),
    scheduleNote: text("schedule_note"),

    /** Bank transfer details. Shown only after someone registers. Owner-only to edit. */
    paymentInstructions: text("payment_instructions"),

    // How long an unpaid registration keeps its place.
    onlineHoldMinutes: integer("online_hold_minutes").notNull().default(30),
    transferHoldHours: integer("transfer_hold_hours").notNull().default(48),
    ...timestamps,
  },
  (t) => [
    // At most one featured event.
    uniqueIndex("events_one_featured").on(t.isFeatured).where(sql`${t.isFeatured}`),
    index("events_listing_idx").on(t.publishStatus, t.startDate),
    check("events_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("events_date_order", sql`${t.endDate} >= ${t.startDate}`),
    check("events_capacity_positive", sql`${t.capacity} > 0`),
    check("events_holds_positive", sql`${t.onlineHoldMinutes} > 0 and ${t.transferHoldHours} > 0`),
  ],
);

export const ticketOptions = pgTable(
  "ticket_options",
  {
    id: id(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    /** In kobo (₦1 = 100 kobo), the unit Paystack uses. 0 means free. */
    priceKobo: bigint("price_kobo", { mode: "number" }).notNull(),
    /** Places for this option, e.g. accommodation. Null means no separate limit. */
    capacity: integer("capacity"),
    isActive: boolean("is_active").notNull().default(true),
    /** Keep false until the price is approved for the public site. */
    showPrice: boolean("show_price").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    // Lets registrations prove that a ticket belongs to their event.
    unique("ticket_options_event_id_id").on(t.eventId, t.id),
    unique("ticket_options_event_name").on(t.eventId, t.name),
    check("ticket_price_not_negative", sql`${t.priceKobo} >= 0`),
    check("ticket_capacity_positive", sql`${t.capacity} > 0`),
  ],
);
