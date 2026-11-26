"use server";

// PUBLIC action: anyone can call it with any data. Everything is checked on the
// server, and prices and availability come from the database.
import { headers } from "next/headers";
import { getDb } from "@/server/db";
import { constraintOf, RuleError } from "@/server/events/service";
import { allowSubmission } from "@/server/registration/rate-limit";
import { register, type Receipt } from "@/server/registration/service";
import { registrationSchema } from "@/server/registration/validation";

export type RegisterState = { message?: string; errors?: Record<string, string>; receipt?: Receipt };

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

/** Which header holds the visitor's address depends on the host. Check at deployment. */
async function visitorAddress() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function registerAction(slug: string, _previous: RegisterState, form: FormData): Promise<RegisterState> {
  // A hidden box people never see. Simple bots tend to fill it in.
  if (text(form, "website")) return { message: "We couldn't process this registration." };

  const parsed = registrationSchema.safeParse({
    submissionId: text(form, "submissionId"),
    fullName: text(form, "fullName"),
    email: text(form, "email"),
    phone: text(form, "phone"),
    ticketId: text(form, "ticketId"),
    shownAmount: text(form, `amount-${text(form, "ticketId")}`),
    privacyConsent: form.get("privacyConsent") === "on",
    marketingConsent: form.get("marketingConsent") === "on",
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Please correct the highlighted fields." };
  }

  try {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
    if (!(await allowSubmission(getDb(), await visitorAddress(), secret))) {
      return { message: "Too many attempts from your connection. Please wait 10 minutes and try again." };
    }
    return { receipt: await register(getDb(), String(slug), parsed.data) };
  } catch (error) {
    if (error instanceof RuleError) {
      return { message: error.message, errors: error.field ? { [error.field]: error.message } : undefined };
    }
    // Do NOT log the error itself: database errors can contain the person's details.
    const cause = (error as { cause?: { code?: string } })?.cause;
    console.error("Registration failed.", {
      type: (error as Error)?.constructor?.name, code: cause?.code, constraint: constraintOf(error),
    });
    return { message: "Something went wrong. Please try again. Trying again from this page will not register you twice." };
  }
}
