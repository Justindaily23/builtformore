import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";

/**
 * Website wording and contacts changed in the admin panel. Only changed items
 * are stored; anything missing uses the original text in src/content.
 */
export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  ...timestamps,
});

/** The founder and leadership team on the About page. Hidden until approved. */
export const teamMembers = pgTable(
  "team_members",
  {
    id: id(),
    name: text("name").notNull(),
    position: text("position"),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    photoPublicId: text("photo_public_id"),
    isFounder: boolean("is_founder").notNull().default(false),
    isVisible: boolean("is_visible").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("team_members_one_founder").on(t.isFounder).where(sql`${t.isFounder}`)],
);

/** Not used by the website any more; see siteContent. Exactly one row (id = 1). */
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
    check("brand_headline_lines", sql`cardinality(${t.headline}) between 1 and 3`),
  ],
);
