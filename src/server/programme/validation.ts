// Server checks for speaker and schedule forms.
import { z } from "zod";
import { speakerRoles } from "@/lib/speaker-roles";

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long (maximum ${max} characters).`);

const optional = (max: number) =>
  z.string().trim().max(max, `Too long (maximum ${max} characters).`).transform((v) => v || null);

const order = z.string().trim().regex(/^\d{1,3}$/, "Enter a whole number from 0 to 999.").transform(Number);

const time = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.").transform((v) => v || null);

function endAfterStart(v: { startTime: string | null; endTime: string | null }, ctx: z.RefinementCtx) {
  if (v.startTime && v.endTime && v.endTime <= v.startTime) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after the start time." });
  }
}

export const profileSchema = z.object({
  name: required("Name", 120),
  professionalTitle: optional(200),
  bio: optional(2000),
});

export const appearanceSchema = z.object({
  role: z.enum(speakerRoles, "Choose a role."),
  sortOrder: order,
  isVisible: z.boolean(),
});

export const speakerSchema = profileSchema.extend(appearanceSchema.shape);

export const existingSpeakerSchema = appearanceSchema.extend({ speakerId: z.uuid("Choose a person.") });

export const daySchema = z
  .object({
    date: z.string().regex(/^20\d{2}-\d{2}-\d{2}$/, "Date is required."),
    title: optional(150),
    startTime: time,
    endTime: time,
  })
  .superRefine(endAfterStart);

export const sessionSchema = z
  .object({
    dayId: z.uuid("Choose a day."),
    title: required("Title", 200),
    description: optional(1000),
    location: optional(150),
    startTime: time,
    endTime: time,
    sortOrder: order,
    isVisible: z.boolean(),
    speakerIds: z.array(z.uuid()).max(30, "Choose 30 people or fewer."),
  })
  .superRefine(endAfterStart);

export const scheduleNoteSchema = z.object({ scheduleNote: optional(300) });

export type SpeakerInput = z.infer<typeof speakerSchema>;
export type ExistingSpeakerInput = z.infer<typeof existingSpeakerSchema>;
export type DayInput = z.infer<typeof daySchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
