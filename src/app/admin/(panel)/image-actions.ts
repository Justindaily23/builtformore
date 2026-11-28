"use server";

// Server Actions can be called directly by anyone, so EVERY action here checks
// permission and validates its input.
import { refresh } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { requirePermission } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { failed, success, text } from "@/server/events/action-helpers";
import { RuleError } from "@/server/events/service";
import * as images from "@/server/images/service";
import { readImageFile } from "@/server/images/validate";

const uuid = z.uuid();

export type ImageTarget =
  | { type: "event"; eventId: string }
  | { type: "speaker"; eventId: string; appearanceId: string }
  | { type: "team"; memberId: string };

const targetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("event"), eventId: uuid }),
  z.object({ type: z.literal("speaker"), eventId: uuid, appearanceId: uuid }),
  z.object({ type: z.literal("team"), memberId: uuid }),
]);

async function apply(adminId: string, raw: ImageTarget, file: Blob | null, alt: string | null) {
  const target = targetSchema.parse(raw);
  const db = getDb();
  if (target.type === "event") await images.setEventImage(db, adminId, target.eventId, file, alt);
  else if (target.type === "speaker") await images.setSpeakerPhoto(db, adminId, target.eventId, target.appearanceId, file);
  else await images.setMemberPhoto(db, adminId, target.memberId, file);
}

const permissionFor = (target: ImageTarget) => (target?.type === "team" ? "manage_content" : "manage_events");

export async function saveImageAction(target: ImageTarget, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission(permissionFor(target));
  try {
    let alt: string | null = null;
    if (target.type === "event") {
      alt = text(form, "alt").trim();
      if (!alt) throw new RuleError("Describe the picture for people who cannot see it.", "alt");
      if (alt.length > 300) throw new RuleError("Keep the description under 300 characters.", "alt");
    }
    await apply(admin.id, target, await readImageFile(form.get("file")), alt);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, "Picture saved.");
}

export async function removeImageAction(target: ImageTarget): Promise<{ ok: boolean; message: string }> {
  const admin = await requirePermission(permissionFor(target));
  try {
    await apply(admin.id, target, null, null);
  } catch (error) {
    return { ok: false, message: failed({ saved: 0 }, error).message! };
  }
  refresh();
  return { ok: true, message: "Picture removed." };
}
