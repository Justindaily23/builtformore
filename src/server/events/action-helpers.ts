// Small helpers shared by the admin actions.
import "server-only";
import type { z } from "zod";
import type { FormState } from "@/lib/form-state";
import { RuleError } from "./service";

export const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

export function invalid(previous: FormState, error: z.ZodError): FormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] ??= issue.message;
  return { saved: previous.saved, errors, message: "Please correct the highlighted fields." };
}

export function failed(previous: FormState, error: unknown): FormState {
  if (error instanceof RuleError) {
    return { saved: previous.saved, message: error.message, errors: error.field ? { [error.field]: error.message } : undefined };
  }
  console.error("Admin action failed:", error);
  return { saved: previous.saved, message: "Something went wrong and nothing was saved. Please try again." };
}

export const success = (previous: FormState, message: string): FormState => ({ ok: true, message, saved: previous.saved + 1 });
