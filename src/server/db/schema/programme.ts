import { sql } from "drizzle-orm";
import {
  boolean, check, date, foreignKey, index, integer, pgTable, primaryKey, text, time, unique, uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { speakerRole } from "./enums";
import { events } from "./events";

/** A person's profile. Can be reused across events. */
export const speakers = pgTable("speakers", {
  id: id(),
  name: text("name").notNull(),
  professionalTitle: text("professional_title"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  photoPublicId: text("photo_public_id"),
  photoAlt: text("photo_alt"),
  ...timestamps,
});

/** A speaker's role at one event. Hidden until confirmed and approved. */
export const eventSpeakers = pgTable(
  "event_speakers",
  {
    id: id(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    speakerId: uuid("speaker_id").notNull().references(() => speakers.id, { onDelete: "restrict" }),
    role: speakerRole("role").notNull().default("speaker"),
    isVisible: boolean("is_visible").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    unique("event_speakers_event_id_id").on(t.eventId, t.id),
    unique("event_speakers_unique_role").on(t.eventId, t.speakerId, t.role),
  ],
);

export const eventDays = pgTable(
  "event_days",
  {
    id: id(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    title: text("title"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    ...timestamps,
  },
  (t) => [
    unique("event_days_event_id_id").on(t.eventId, t.id),
    unique("event_days_one_per_date").on(t.eventId, t.date),
    check("event_days_time_order", sql`${t.endTime} > ${t.startTime}`),
  ],
);

// "sessions" in the programme sense. Named event_sessions so it cannot clash
// with the login sessions table that a login tool may add.
export const eventSessions = pgTable(
  "event_sessions",
  {
    id: id(),
    eventId: uuid("event_id").notNull(),
    dayId: uuid("day_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    location: text("location"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    unique("event_sessions_event_id_id").on(t.eventId, t.id),
    // The day must belong to the same event.
    foreignKey({
      name: "event_sessions_day_fk",
      columns: [t.eventId, t.dayId],
      foreignColumns: [eventDays.eventId, eventDays.id],
    }).onDelete("cascade"),
    index("event_sessions_day_idx").on(t.dayId, t.sortOrder),
    check("event_sessions_time_order", sql`${t.endTime} > ${t.startTime}`),
  ],
);

export const sessionSpeakers = pgTable(
  "session_speakers",
  {
    eventId: uuid("event_id").notNull(),
    sessionId: uuid("session_id").notNull(),
    eventSpeakerId: uuid("event_speaker_id").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.sessionId, t.eventSpeakerId] }),
    // Session and speaker must belong to the same event.
    foreignKey({
      name: "session_speakers_session_fk",
      columns: [t.eventId, t.sessionId],
      foreignColumns: [eventSessions.eventId, eventSessions.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "session_speakers_speaker_fk",
      columns: [t.eventId, t.eventSpeakerId],
      foreignColumns: [eventSpeakers.eventId, eventSpeakers.id],
    }).onDelete("cascade"),
  ],
);
