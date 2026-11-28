"use server";

// Server Actions can be called directly by anyone, so EVERY action here checks
// permission and validates its input.
import { refresh } from "next/cache";
import { contentGroups, type ContentGroupId, type SiteContent } from "@/content/editable";
import type { FormState } from "@/lib/form-state";
import { requirePermission } from "@/server/auth/session";
import { saveContent } from "@/server/content/service";
import { checkField } from "@/server/content/validation";
import { getDb } from "@/server/db";
import { failed, success, text } from "@/server/events/action-helpers";

export async function saveContentAction(groupId: ContentGroupId, previous: FormState, form: FormData): Promise<FormState> {
  const admin = await requirePermission("manage_content");
  const group = contentGroups.find((g) => g.id === groupId);
  if (!group) return { saved: previous.saved, message: "Unknown section." };

  // Only this section's named items are read. Anything extra is ignored.
  const values: Partial<SiteContent> = {};
  const errors: Record<string, string> = {};
  for (const field of group.fields) {
    // A missing item must not be mistaken for "restore the original".
    if (typeof form.get(field.key) !== "string") {
      return { saved: previous.saved, message: "The form was incomplete. Reload the page and try again." };
    }
    const result = checkField(field, text(form, field.key));
    if ("error" in result) errors[field.key] = result.error;
    else values[field.key] = result.value;
  }
  if (Object.keys(errors).length) {
    return { saved: previous.saved, errors, message: "Please correct the highlighted fields." };
  }
  let changed: number;
  try {
    changed = await saveContent(getDb(), admin.id, group.id, text(form, "version"), values);
  } catch (error) {
    return failed(previous, error);
  }
  refresh();
  return success(previous, changed ? "Saved. The website now shows these changes." : "There was nothing to change.");
}
