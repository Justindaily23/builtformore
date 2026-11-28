ALTER TYPE "public"."speaker_role" ADD VALUE 'moderator';--> statement-breakpoint
ALTER TYPE "public"."speaker_role" ADD VALUE 'guest';--> statement-breakpoint
ALTER TABLE "brand_settings" DROP CONSTRAINT "brand_headline_three_lines";--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "brand_settings" ADD CONSTRAINT "brand_headline_lines" CHECK (cardinality("brand_settings"."headline") between 1 and 3);