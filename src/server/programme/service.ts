// Speaker and schedule changes. Callers MUST check permission first.
// Every change locks the event, and every ID is matched against that event, so
// an ID from another event cannot be used.
import { and, count, eq, inArray } from "drizzle-orm";
import { eventDays, eventSessions, events, eventSpeakers, sessionSpeakers, speakers } from "@/server/db/schema";
import { constraintOf, lockEvent, log, RuleError, type Db, type Tx } from "@/server/events/service";
import type { DayInput, ExistingSpeakerInput, SessionInput, SpeakerInput } from "./validation";

async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    switch (constraintOf(error)) {
      case "event_speakers_unique_role":
        throw new RuleError("This person already has that role at this event.", "role");
      case "event_days_one_per_date":
        throw new RuleError("The schedule already has a day with this date.", "date");
      default:
        throw error;
    }
  }
}

function change<T>(db: Db, eventId: string, work: (tx: Tx, event: typeof events.$inferSelect) => Promise<T>) {
  return guard(() => db.transaction(async (tx) => work(tx, await lockEvent(tx, eventId))));
}

async function findAppearance(tx: Tx, eventId: string, id: string) {
  const [row] = await tx.select().from(eventSpeakers).where(and(eq(eventSpeakers.id, id), eq(eventSpeakers.eventId, eventId)));
  if (!row) throw new RuleError("This person is no longer part of the event. Reload the page.");
  return row;
}

export function addSpeaker(db: Db, adminId: string, eventId: string, input: SpeakerInput) {
  return change(db, eventId, async (tx) => {
    const { name, professionalTitle, bio, ...appearance } = input;
    const [person] = await tx.insert(speakers).values({ name, professionalTitle, bio }).returning({ id: speakers.id });
    const [row] = await tx.insert(eventSpeakers).values({ eventId, speakerId: person.id, ...appearance }).returning({ id: eventSpeakers.id });
    await log(tx, adminId, "speaker.added", "event_speaker", row.id, { eventId, name, role: input.role, isVisible: input.isVisible });
  });
}

export function addExistingSpeaker(db: Db, adminId: string, eventId: string, input: ExistingSpeakerInput) {
  return change(db, eventId, async (tx) => {
    // Locked so the profile cannot be removed while we are linking to it.
    const [person] = await tx.select().from(speakers).where(eq(speakers.id, input.speakerId)).for("update");
    if (!person) throw new RuleError("This person no longer exists. Reload the page.", "speakerId");
    const [row] = await tx.insert(eventSpeakers).values({ eventId, ...input }).returning({ id: eventSpeakers.id });
    await log(tx, adminId, "speaker.added", "event_speaker", row.id, { eventId, name: person.name, role: input.role, isVisible: input.isVisible });
  });
}

export function updateSpeaker(db: Db, adminId: string, eventId: string, appearanceId: string, input: SpeakerInput) {
  return change(db, eventId, async (tx) => {
    const current = await findAppearance(tx, eventId, appearanceId);
    const { name, professionalTitle, bio, ...appearance } = input;
    // The profile is shared by every event this person appears in.
    await tx.update(speakers).set({ name, professionalTitle, bio }).where(eq(speakers.id, current.speakerId));
    await tx.update(eventSpeakers).set(appearance).where(eq(eventSpeakers.id, appearanceId));
    await log(tx, adminId, "speaker.updated", "event_speaker", appearanceId, {
      eventId, name, role: input.role, isVisible: input.isVisible, wasVisible: current.isVisible,
    });
  });
}

/** Returns the ID of a photo that is no longer used, for the caller to delete. */
export function removeSpeaker(db: Db, adminId: string, eventId: string, appearanceId: string) {
  return change(db, eventId, async (tx) => {
    const current = await findAppearance(tx, eventId, appearanceId);
    const [person] = await tx.select().from(speakers).where(eq(speakers.id, current.speakerId)).for("update");
    await tx.delete(eventSpeakers).where(eq(eventSpeakers.id, appearanceId));
    // A profile that no event uses is deleted, so unused details are not kept.
    const [left] = await tx.select({ total: count() }).from(eventSpeakers).where(eq(eventSpeakers.speakerId, current.speakerId));
    if (left.total === 0) await tx.delete(speakers).where(eq(speakers.id, current.speakerId));
    await log(tx, adminId, "speaker.removed", "event_speaker", appearanceId, { eventId, name: person?.name, role: current.role });
    return left.total === 0 ? (person?.photoPublicId ?? null) : null;
  });
}

/** dayId is null for a new day. */
export function saveDay(db: Db, adminId: string, eventId: string, dayId: string | null, input: DayInput) {
  return change(db, eventId, async (tx, event) => {
    if (input.date < event.startDate || input.date > event.endDate) {
      throw new RuleError("Choose a date within the event's dates. To change those, edit the event details.", "date");
    }
    if (!dayId) {
      const [day] = await tx.insert(eventDays).values({ eventId, ...input }).returning({ id: eventDays.id });
      await log(tx, adminId, "day.created", "event_day", day.id, { eventId, date: input.date });
      return;
    }
    const [day] = await tx.update(eventDays).set(input)
      .where(and(eq(eventDays.id, dayId), eq(eventDays.eventId, eventId))).returning({ id: eventDays.id });
    if (!day) throw new RuleError("This day no longer exists. Reload the page.");
    await log(tx, adminId, "day.updated", "event_day", dayId, { eventId, date: input.date });
  });
}

/** Also deletes the day's sessions. */
export function deleteDay(db: Db, adminId: string, eventId: string, dayId: string) {
  return change(db, eventId, async (tx) => {
    const [gone] = await tx.delete(eventDays)
      .where(and(eq(eventDays.id, dayId), eq(eventDays.eventId, eventId))).returning({ date: eventDays.date });
    if (!gone) throw new RuleError("This day no longer exists. Reload the page.");
    await log(tx, adminId, "day.deleted", "event_day", dayId, { eventId, date: gone.date });
  });
}

/** sessionId is null for a new session. */
export function saveSession(db: Db, adminId: string, eventId: string, sessionId: string | null, input: SessionInput) {
  return change(db, eventId, async (tx) => {
    const { speakerIds, ...values } = input;
    const [day] = await tx.select({ id: eventDays.id }).from(eventDays)
      .where(and(eq(eventDays.id, values.dayId), eq(eventDays.eventId, eventId)));
    if (!day) throw new RuleError("That day no longer exists. Reload the page.", "dayId");

    const chosen = [...new Set(speakerIds)];
    if (chosen.length) {
      const found = await tx.select({ id: eventSpeakers.id }).from(eventSpeakers)
        .where(and(eq(eventSpeakers.eventId, eventId), inArray(eventSpeakers.id, chosen)));
      if (found.length !== chosen.length) throw new RuleError("A chosen person is no longer part of this event. Reload the page.");
    }

    let id = sessionId;
    if (!id) {
      [{ id }] = await tx.insert(eventSessions).values({ eventId, ...values }).returning({ id: eventSessions.id });
    } else {
      const [row] = await tx.update(eventSessions).set(values)
        .where(and(eq(eventSessions.id, id), eq(eventSessions.eventId, eventId))).returning({ id: eventSessions.id });
      if (!row) throw new RuleError("This session no longer exists. Reload the page.");
      await tx.delete(sessionSpeakers).where(eq(sessionSpeakers.sessionId, id));
    }
    if (chosen.length) {
      await tx.insert(sessionSpeakers).values(chosen.map((eventSpeakerId) => ({ eventId, sessionId: id!, eventSpeakerId })));
    }
    await log(tx, adminId, sessionId ? "session.updated" : "session.created", "event_session", id!, { eventId, title: values.title });
  });
}

export function deleteSession(db: Db, adminId: string, eventId: string, sessionId: string) {
  return change(db, eventId, async (tx) => {
    const [gone] = await tx.delete(eventSessions)
      .where(and(eq(eventSessions.id, sessionId), eq(eventSessions.eventId, eventId))).returning({ title: eventSessions.title });
    if (!gone) throw new RuleError("This session no longer exists. Reload the page.");
    await log(tx, adminId, "session.deleted", "event_session", sessionId, { eventId, title: gone.title });
  });
}

export function saveScheduleNote(db: Db, adminId: string, eventId: string, scheduleNote: string | null) {
  return change(db, eventId, async (tx) => {
    await tx.update(events).set({ scheduleNote }).where(eq(events.id, eventId));
    await log(tx, adminId, "schedule.note_changed", "event", eventId);
  });
}

export function setScheduleVisible(db: Db, adminId: string, eventId: string, visible: boolean) {
  return change(db, eventId, async (tx, event) => {
    if (visible) {
      const days = await tx.select({ date: eventDays.date }).from(eventDays).where(eq(eventDays.eventId, eventId));
      if (days.some((d) => d.date < event.startDate || d.date > event.endDate)) {
        throw new RuleError("Some days are outside the event dates. Correct or delete them first.");
      }
      const [sessions] = await tx.select({ total: count() }).from(eventSessions)
        .where(and(eq(eventSessions.eventId, eventId), eq(eventSessions.isVisible, true)));
      if (sessions.total === 0) throw new RuleError("Add at least one visible session first.");
    }
    await tx.update(events).set({ showSchedule: visible }).where(eq(events.id, eventId));
    await log(tx, adminId, visible ? "schedule.shown" : "schedule.hidden", "event", eventId);
  });
}
