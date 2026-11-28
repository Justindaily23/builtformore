"use client";

import { useActionState } from "react";
import { confirmBankTransferAction } from "@/app/admin/(panel)/events/actions";
import { emptyState } from "@/lib/form-state";
import { Field, Message, keepValues, primaryButton } from "./form-parts";

export function ConfirmBankTransferForm({
  eventId,
  registrationId,
}: {
  eventId: string;
  registrationId: string;
}) {
  const [state, action, pending] = useActionState(
    confirmBankTransferAction.bind(null, eventId, registrationId),
    emptyState,
  );
  const verifiedError = state.errors?.verified;
  const verifiedId = `confirm-${registrationId}-verified`;

  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="space-y-3">
        <Field
          errors={state.errors}
          idPrefix={`confirm-${registrationId}`}
          label="Bank transaction reference"
          name="bankReference"
          required
          autoComplete="off"
        />
        <Field
          errors={state.errors}
          idPrefix={`confirm-${registrationId}`}
          label="Internal verification note"
          name="note"
          rows={2}
          required
          hint="Record what you checked in the account statement. Do not include participants’ personal details."
        />
        <div>
          <label htmlFor={verifiedId} className="flex min-h-11 items-start gap-3 py-1">
            <input
              id={verifiedId}
              type="checkbox"
              name="verified"
              required
              aria-invalid={verifiedError ? true : undefined}
              aria-describedby={verifiedError ? `${verifiedId}-error` : undefined}
              className="mt-1 size-5 shrink-0 accent-plum"
            />
            <span className="font-semibold">
              I checked the bank account and verified that the full expected amount was received.
            </span>
          </label>
          {verifiedError && (
            <p id={`${verifiedId}-error`} className="mt-1 text-sm font-semibold text-red-800">
              {verifiedError}
            </p>
          )}
        </div>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Confirming…" : "Confirm bank transfer"}
        </button>
      </form>
      <Message state={state} />
    </div>
  );
}
