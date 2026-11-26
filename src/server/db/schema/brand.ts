import { sql } from "drizzle-orm";
import { check, integer, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

/** Exactly one row (id = 1). */
export const brandSettings = pgTable(
  "brand_settings",
  {
    id: integer("id").primaryKey().default(1),
    name: text("name").notNull(),
    descriptor: text("descriptor").notNull(),
    headline: text("headline").array().notNull(),
    promise: text("promise").notNull(),
    intro: text("intro").notNull(),
    // Empty (null) means "not provided yet". The page decides what to show.
    email: text("email"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    location: text("location"),
    ...timestamps,
  },
  (t) => [
    check("brand_single_row", sql`${t.id} = 1`),
    check("brand_headline_three_lines", sql`cardinality(${t.headline}) = 3`),
  ],
);
