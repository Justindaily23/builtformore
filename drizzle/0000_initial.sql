CREATE TYPE "public"."admin_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('paystack', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'successful', 'failed', 'abandoned', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'confirmed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."registration_window" AS ENUM('coming_soon', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."speaker_role" AS ENUM('convener', 'keynote', 'speaker', 'panelist', 'facilitator');--> statement-breakpoint
CREATE TABLE "brand_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"descriptor" text NOT NULL,
	"headline" text[] NOT NULL,
	"promise" text NOT NULL,
	"intro" text NOT NULL,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_single_row" CHECK ("brand_settings"."id" = 1),
	CONSTRAINT "brand_headline_three_lines" CHECK (cardinality("brand_settings"."headline") = 3)
);
--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "admin_role" DEFAULT 'staff' NOT NULL,
	"can_confirm_payments" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"theme" text,
	"summary" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"timezone" text DEFAULT 'Africa/Lagos' NOT NULL,
	"venue" text,
	"address" text,
	"map_url" text,
	"audience" text,
	"accessibility_notes" text,
	"image_url" text,
	"image_alt" text,
	"contact_email" text,
	"contact_phone" text,
	"contact_whatsapp" text,
	"publish_status" "publish_status" DEFAULT 'draft' NOT NULL,
	"registration_status" "registration_window" DEFAULT 'coming_soon' NOT NULL,
	"registration_deadline" timestamp with time zone,
	"capacity" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"show_schedule" boolean DEFAULT false NOT NULL,
	"schedule_note" text,
	"online_hold_minutes" integer DEFAULT 30 NOT NULL,
	"transfer_hold_hours" integer DEFAULT 48 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "events_slug_format" CHECK ("events"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "events_date_order" CHECK ("events"."end_date" >= "events"."start_date"),
	CONSTRAINT "events_capacity_positive" CHECK ("events"."capacity" > 0),
	CONSTRAINT "events_holds_positive" CHECK ("events"."online_hold_minutes" > 0 and "events"."transfer_hold_hours" > 0)
);
--> statement-breakpoint
CREATE TABLE "ticket_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_kobo" bigint NOT NULL,
	"capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"show_price" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_options_event_id_id" UNIQUE("event_id","id"),
	CONSTRAINT "ticket_options_event_name" UNIQUE("event_id","name"),
	CONSTRAINT "ticket_price_not_negative" CHECK ("ticket_options"."price_kobo" >= 0),
	CONSTRAINT "ticket_capacity_positive" CHECK ("ticket_options"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "event_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"date" date NOT NULL,
	"title" text,
	"start_time" time,
	"end_time" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_days_event_id_id" UNIQUE("event_id","id"),
	CONSTRAINT "event_days_one_per_date" UNIQUE("event_id","date"),
	CONSTRAINT "event_days_time_order" CHECK ("event_days"."end_time" > "event_days"."start_time")
);
--> statement-breakpoint
CREATE TABLE "event_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"day_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" time,
	"end_time" time,
	"location" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_sessions_event_id_id" UNIQUE("event_id","id"),
	CONSTRAINT "event_sessions_time_order" CHECK ("event_sessions"."end_time" > "event_sessions"."start_time")
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"speaker_id" uuid NOT NULL,
	"role" "speaker_role" DEFAULT 'speaker' NOT NULL,
	"is_visible" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_speakers_event_id_id" UNIQUE("event_id","id"),
	CONSTRAINT "event_speakers_unique_role" UNIQUE("event_id","speaker_id","role")
);
--> statement-breakpoint
CREATE TABLE "session_speakers" (
	"event_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"event_speaker_id" uuid NOT NULL,
	CONSTRAINT "session_speakers_session_id_event_speaker_id_pk" PRIMARY KEY("session_id","event_speaker_id")
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"professional_title" text,
	"bio" text,
	"photo_url" text,
	"photo_alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_kobo" bigint NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"reference" text NOT NULL,
	"provider_transaction_id" text,
	"channel" text,
	"bank_reference" text,
	"note" text,
	"confirmed_by_admin_id" uuid,
	"paid_at" timestamp with time zone,
	"needs_review" boolean DEFAULT false NOT NULL,
	"review_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_unique" UNIQUE("reference"),
	CONSTRAINT "payments_provider_transaction_id_unique" UNIQUE("provider_transaction_id"),
	CONSTRAINT "payments_bank_reference_unique" UNIQUE("bank_reference"),
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount_kobo" > 0),
	CONSTRAINT "payments_currency_ngn" CHECK ("payments"."currency" = 'NGN'),
	CONSTRAINT "payments_success_has_date" CHECK ("payments"."status" <> 'successful' or "payments"."paid_at" is not null),
	CONSTRAINT "payments_manual_proof" CHECK ("payments"."method" <> 'bank_transfer' or "payments"."status" <> 'successful' or (
        "payments"."confirmed_by_admin_id" is not null
        and coalesce(trim("payments"."bank_reference"), '') <> ''
        and coalesce(trim("payments"."note"), '') <> ''
      )),
	CONSTRAINT "payments_review_has_reason" CHECK (not "payments"."needs_review" or "payments"."review_reason" is not null)
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_option_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"ticket_name" text NOT NULL,
	"amount_kobo" bigint NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"hold_expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"privacy_consent_at" timestamp with time zone NOT NULL,
	"privacy_notice_version" text NOT NULL,
	"marketing_consent_at" timestamp with time zone,
	"age_confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_reference_unique" UNIQUE("reference"),
	CONSTRAINT "registrations_amount_not_negative" CHECK ("registrations"."amount_kobo" >= 0),
	CONSTRAINT "registrations_confirmed_has_date" CHECK ("registrations"."status" <> 'confirmed' or "registrations"."confirmed_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'paystack' NOT NULL,
	"event_type" text NOT NULL,
	"event_key" text NOT NULL,
	"summary" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "webhook_events_unique" UNIQUE("provider","event_type","event_key")
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_options" ADD CONSTRAINT "ticket_options_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_day_fk" FOREIGN KEY ("event_id","day_id") REFERENCES "public"."event_days"("event_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_session_fk" FOREIGN KEY ("event_id","session_id") REFERENCES "public"."event_sessions"("event_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_speaker_fk" FOREIGN KEY ("event_id","event_speaker_id") REFERENCES "public"."event_speakers"("event_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_admin_id_admin_users_id_fk" FOREIGN KEY ("confirmed_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_ticket_fk" FOREIGN KEY ("event_id","ticket_option_id") REFERENCES "public"."ticket_options"("event_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_entity_idx" ON "activity_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_log_created_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "events_one_featured" ON "events" USING btree ("is_featured") WHERE "events"."is_featured";--> statement-breakpoint
CREATE INDEX "events_listing_idx" ON "events" USING btree ("publish_status","start_date");--> statement-breakpoint
CREATE INDEX "event_sessions_day_idx" ON "event_sessions" USING btree ("day_id","sort_order");--> statement-breakpoint
CREATE INDEX "payments_registration_idx" ON "payments" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "payments_review_idx" ON "payments" USING btree ("needs_review") WHERE "payments"."needs_review";--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_one_active_per_email" ON "registrations" USING btree ("event_id",lower("email")) WHERE "registrations"."status" in ('pending', 'confirmed');--> statement-breakpoint
CREATE INDEX "registrations_event_status_idx" ON "registrations" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "registrations_ticket_status_idx" ON "registrations" USING btree ("ticket_option_id","status");