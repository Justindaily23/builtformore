// Server checks for the website wording forms.
import type { EditableField } from "@/content/editable";
import { z } from "zod";
import { toPairs } from "@/lib/content-text";

/** The cleaned value, or a message for the admin. An empty value is allowed. */
export function checkField(field: EditableField, raw: string): { value: string } | { error: string } {
  const value = raw.replace(/\r\n?/g, "\n").trim();
  if (!value) return { value };
  if (value.length > field.max) return { error: `Maximum ${field.max.toLocaleString("en-NG")} characters.` };
  if ((field.kind === "line" || field.kind === "email" || field.kind === "url") && value.includes("\n")) {
    return { error: "Use a single line." };
  }
  if (field.kind === "email" && !z.email().safeParse(value).success) return { error: "Enter a valid email address." };
  if (field.kind === "url" && !(/^https:\/\//i.test(value) && URL.canParse(value))) {
    return { error: "Use a full link starting with https://" };
  }
  if (field.kind === "pairs") {
    const pairs = toPairs(value);
    if (pairs.length > 12) return { error: "Use 12 lines or fewer." };
    if (pairs.some((p) => !p.title || !p.text)) return { error: "Write each line as “Title: short description”." };
    if (new Set(pairs.map((p) => p.title.toLowerCase())).size !== pairs.length) return { error: "Each title must be different." };
  }
  return { value };
}
