"use server";

// Server Actions can be called directly by anyone, so EVERY action here checks
// permission and validates its input.
import { refresh } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { requirePermission } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { failed, invalid, success, text } from "@/server/events/action-helpers";
import { deleteImage } from "@/server/images/cloudinary";
import * as service from "@/server/team/service";
import { memberSchema } from "@/server/team/validation";

const uuid = z.uuid();

export async function saveMemberAction(memberId: string | null, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_content");
  const parsed = memberSchema.safeParse({
    name: text(form, "name"), position: text(form, "position"), bio: text(form, "bio"), sortOrder: text(form, "sortOrder"),
    isFounder: form.get("isFounder") === "on",
    isVisible: form.get("isVisible") === "on",
  });
  if (!parsed.success) return invalid(previous, parsed.error);
  try {
    await service.saveMember(getDb(), admin.id, memberId === null ? null : uuid.parse(memberId), parsed.data);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, memberId ? "Saved." : "Person added.");
}

export async function deleteMemberAction(memberId: string): Promise<{ ok: boolean; message: string }> {
  const admin = await requirePermission("manage_content");
  try {
    await deleteImage(await service.deleteMember(getDb(), admin.id, uuid.parse(memberId)));
  } catch (error) {
    return { ok: false, message: failed({ saved: 0 }, error).message! };
  }
  refresh();
  return { ok: true, message: "Removed." };
}
