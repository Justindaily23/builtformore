"use client";

import { useActionState } from "react";
import { savePaymentInstructionsAction } from "@/app/admin/(panel)/events/actions";
import { emptyState } from "@/lib/form-state";
import { Field, Message, keepValues, primaryButton } from "./form-parts";

export function PaymentInstructions({ eventId, value, canEdit }: { eventId: string; value: string | null; canEdit: boolean }) {
  const [state, action, pending] = useActionState(savePaymentInstructionsAction.bind(null, eventId), emptyState);
  return (
    <section aria-labelledby="payment-title" className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
      <h2 id="payment-title" className="font-display text-2xl">Payment instructions</h2>
      <p className="mt-1 text-sm">Shown to people after they register, with their reference and amount.</p>
      {canEdit ? (
        <div className="mt-4 space-y-3">
          <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="space-y-3">
            <Field errors={state.errors} idPrefix="pay" label="Bank transfer details" name="paymentInstructions" rows={5}
              defaultValue={value} hint="Bank name, account name, account number, and where to send proof of payment. Check every digit." />
            <button type="submit" disabled={pending} className={`w-full sm:w-auto ${primaryButton}`}>
              {pending ? "Saving…" : "Save payment instructions"}
            </button>
          </form>
          <Message state={state} />
        </div>
      ) : (
        <>
          <p className="mt-4 whitespace-pre-line wrap-anywhere">{value ?? "None added yet."}</p>
          <p className="mt-3 text-sm font-semibold">Only an owner can change these.</p>
        </>
      )}
    </section>
  );
}
