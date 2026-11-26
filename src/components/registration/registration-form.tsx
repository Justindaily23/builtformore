"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useSyncExternalStore } from "react";
import { registerAction, type RegisterState } from "@/app/(site)/events/[slug]/register/actions";
import { Field, keepValues, primaryButton } from "@/components/admin/form-parts";
import { formatNaira } from "@/lib/money";
import type { RegistrationOption } from "@/server/public/registration";
import { ReceiptView } from "./receipt";

const price = (kobo: number) => (kobo === 0 ? "Free" : formatNaira(kobo));

// False in the server's HTML, true once the page's code is running.
const useReady = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export function RegistrationForm({ slug, submissionId, tickets }: { slug: string; submissionId: string; tickets: RegistrationOption[] }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAction.bind(null, slug), {});
  const ready = useReady();
  const form = useRef<HTMLFormElement>(null);
  const available = tickets.filter((t) => !t.soldOut);

  // After a failed try, move to the first problem so it is not missed.
  useEffect(() => {
    const target = form.current?.querySelector<HTMLElement>("[aria-invalid=true], [data-invalid]:not(:disabled)")
      ?? form.current?.querySelector<HTMLElement>("[data-error]");
    if (state.message) target?.focus();
  }, [state]);

  if (state.receipt) return <ReceiptView receipt={state.receipt} />;

  const errorText = (name: string) =>
    state.errors?.[name] && (
      <p id={`r-${name}-error`} className="mt-1 text-sm font-semibold text-red-800">{state.errors[name]}</p>
    );

  return (
    <form ref={form} method="post" onSubmit={keepValues(action)} noValidate className="space-y-6">
      <input type="hidden" name="submissionId" value={submissionId} />

      <fieldset aria-describedby={state.errors?.ticketId ? "r-ticketId-error" : undefined}>
        <legend className="font-display text-2xl">Choose your option</legend>
        <div className="mt-3 space-y-3">
          {tickets.map((t) => (
            <label key={t.id} className="flex gap-3 rounded-xl border border-plum/40 bg-white p-4 has-checked:border-2 has-checked:border-plum has-disabled:opacity-60">
              <input type="radio" name="ticketId" value={t.id} disabled={t.soldOut}
                defaultChecked={available.length === 1 && !t.soldOut}
                data-invalid={state.errors?.ticketId ? true : undefined}
                className="mt-1 size-5 shrink-0 accent-plum" />
              <input type="hidden" name={`amount-${t.id}`} value={t.priceKobo} />
              <span className="min-w-0 wrap-anywhere">
                <span className="block font-semibold">{t.name}</span>
                <span className="block text-lg">{price(t.priceKobo)}</span>
                {t.description && <span className="block text-sm">{t.description}</span>}
                {t.soldOut && <span className="block font-semibold">Fully booked</span>}
              </span>
            </label>
          ))}
        </div>
        {errorText("ticketId")}
      </fieldset>

      <div className="space-y-4">
        <h2 className="font-display text-2xl">Your details</h2>
        <Field idPrefix="r" errors={state.errors} label="Full name" name="fullName" required autoComplete="name" />
        <Field idPrefix="r" errors={state.errors} label="Email address" name="email" type="email" required autoComplete="email" />
        <Field idPrefix="r" errors={state.errors} label="Phone number" name="phone" type="tel" required autoComplete="tel" />
      </div>

      {/* Hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="space-y-3">
        <div>
          <label className="flex min-h-11 items-start gap-3">
            <input type="checkbox" name="privacyConsent" className="mt-1 size-5 shrink-0 accent-plum"
              aria-invalid={state.errors?.privacyConsent ? true : undefined}
              aria-describedby={state.errors?.privacyConsent ? "r-privacyConsent-error" : undefined} />
            <span>
              I agree to my details being used to manage my registration, as explained in the{" "}
              <Link href="/privacy" target="_blank" className="font-semibold underline underline-offset-4">
                privacy notice (opens in a new tab)
              </Link>. <span aria-hidden="true">*</span>
            </span>
          </label>
          {errorText("privacyConsent")}
        </div>
        <label className="flex min-h-11 items-start gap-3">
          <input type="checkbox" name="marketingConsent" className="mt-1 size-5 shrink-0 accent-plum" />
          <span>Send me news about future events. (Optional)</span>
        </label>
      </div>

      <p role="alert" tabIndex={-1} data-error={state.message ? true : undefined} className="font-semibold text-red-800 empty:hidden">
        {state.message}
      </p>
      <button type="submit" disabled={!ready || pending} className={`w-full ${primaryButton}`}>
        {pending ? "Registering…" : "Register"}
      </button>
      <noscript><p>Please turn on JavaScript to register.</p></noscript>
    </form>
  );
}
