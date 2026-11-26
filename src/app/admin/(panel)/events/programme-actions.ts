"use server";

// Server Actions can be called directly by anyone, so EVERY action here checks
// permission and validates its input.
import { refresh } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { requirePermission } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { failed, invalid, success, text } from "@/server/events/action-helpers";
import * as service from "@/server/programme/service";
import {
  daySchema, existingSpeakerSchema, scheduleNoteSchema, sessionSchema, speakerSchema,
} from "@/server/programme/validation";

const uuid = z.uuid();
type Result = { ok: boolean; message: string };

const readFields = <K extends string>(form: FormData, keys: readonly K[]) =>
  Object.fromEntries(keys.map((key) => [key, text(form, key)])) as Record<K, string>;

/** Runs a form save: validate, change the database, refresh the screen. */
async function save<T>(
  previous: FormState, parsed: z.ZodSafeParseResult<T>, work: (data: T) => Promise<unknown>, done: string,
): Promise<FormState> {
  if (!parsed.success) return invalid(previous, parsed.error);
  try {
    await work(parsed.data);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, done);
}

/** Runs a button action such as delete. */
async function run(work: () => Promise<unknown>, done: string): Promise<Result> {
  try {
    await work();
  } catch (error) {
    return { ok: false, message: failed({ saved: 0 }, error).message! };
  }
  refresh();
  return { ok: true, message: done };
}

export async function saveSpeakerAction(
  eventId: string, appearanceId: string | null, previous: FormState, form: FormData,
): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = speakerSchema.safeParse({
    ...readFields(form, ["name", "professionalTitle", "bio", "role", "sortOrder"]),
    isVisible: form.get("isVisible") === "on",
  });
  return save(previous, parsed, async (data) => {
    if (appearanceId === null) await service.addSpeaker(getDb(), admin.id, uuid.parse(eventId), data);
    else await service.updateSpeaker(getDb(), admin.id, uuid.parse(eventId), uuid.parse(appearanceId), data);
  }, appearanceId ? "Saved." : "Person added.");
}

export async function addExistingSpeakerAction(eventId: string, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = existingSpeakerSchema.safeParse({
    ...readFields(form, ["speakerId", "role", "sortOrder"]),
    isVisible: form.get("isVisible") === "on",
  });
  return save(previous, parsed, (data) => service.addExistingSpeaker(getDb(), admin.id, uuid.parse(eventId), data), "Person added.");
}

export async function removeSpeakerAction(eventId: string, appearanceId: string): Promise<Result> {
  const admin = await requirePermission("manage_events");
  return run(() => service.removeSpeaker(getDb(), admin.id, uuid.parse(eventId), uuid.parse(appearanceId)), "Removed.");
}

export async function saveDayAction(eventId: string, dayId: string | null, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = daySchema.safeParse(readFields(form, ["date", "title", "startTime", "endTime"]));
  return save(previous, parsed, (data) =>
    service.saveDay(getDb(), admin.id, uuid.parse(eventId), dayId === null ? null : uuid.parse(dayId), data),
  dayId ? "Day saved." : "Day added.");
}

export async function deleteDayAction(eventId: string, dayId: string): Promise<Result> {
  const admin = await requirePermission("manage_events");
  return run(() => service.deleteDay(getDb(), admin.id, uuid.parse(eventId), uuid.parse(dayId)), "Day deleted.");
}

export async function saveSessionAction(
  eventId: string, sessionId: string | null, previous: FormState, form: FormData,
): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = sessionSchema.safeParse({
    ...readFields(form, ["dayId", "title", "description", "location", "startTime", "endTime", "sortOrder"]),
    isVisible: form.get("isVisible") === "on",
    speakerIds: form.getAll("speakerIds"),
  });
  return save(previous, parsed, (data) =>
    service.saveSession(getDb(), admin.id, uuid.parse(eventId), sessionId === null ? null : uuid.parse(sessionId), data),
  sessionId ? "Session saved." : "Session added.");
}

export async function deleteSessionAction(eventId: string, sessionId: string): Promise<Result> {
  const admin = await requirePermission("manage_events");
  return run(() => service.deleteSession(getDb(), admin.id, uuid.parse(eventId), uuid.parse(sessionId)), "Session deleted.");
}

export async function saveScheduleNoteAction(eventId: string, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_events");
  const parsed = scheduleNoteSchema.safeParse(readFields(form, ["scheduleNote"]));
  return save(previous, parsed, (data) =>
    service.saveScheduleNote(getDb(), admin.id, uuid.parse(eventId), data.scheduleNote), "Note saved.");
}

export async function setScheduleVisibleAction(eventId: string, visible: boolean): Promise<Result> {
  const admin = await requirePermission("manage_events");
  return run(
    () => service.setScheduleVisible(getDb(), admin.id, uuid.parse(eventId), z.boolean().parse(visible)),
    visible ? "The schedule is now shown on the event page." : "The schedule is now hidden.",
  );
}
