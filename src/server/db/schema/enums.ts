import { pgEnum } from "drizzle-orm/pg-core";

export const publishStatus = pgEnum("publish_status", ["draft", "published", "archived"]);
export const registrationWindow = pgEnum("registration_window", ["coming_soon", "open", "closed"]);
export const speakerRole = pgEnum("speaker_role", ["convener", "keynote", "speaker", "panelist", "facilitator"]);
export const registrationStatus = pgEnum("registration_status", ["pending", "confirmed", "expired", "cancelled"]);
export const paymentMethod = pgEnum("payment_method", ["paystack", "bank_transfer"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "successful", "failed", "abandoned", "refunded"]);
export const adminRole = pgEnum("admin_role", ["owner", "staff"]);
