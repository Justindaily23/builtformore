"use client";

import { startTransition, type FormEvent } from "react";
import type { FormState } from "@/lib/form-state";

export const inputStyle =
  "mt-1 block min-h-12 w-full rounded-lg border border-plum/50 bg-white px-3 py-2 text-base text-plum aria-invalid:border-2 aria-invalid:border-red-800";

export const primaryButton =
  "min-h-12 rounded-full bg-plum px-6 font-semibold text-ivory hover:bg-plum-950 disabled:opacity-60";

export const secondaryButton =
  "min-h-11 rounded-full border border-plum/50 bg-white px-5 font-semibold hover:bg-rose-light disabled:opacity-50";

// Submitting this way stops React clearing the form, so nothing typed is lost
// when the server finds a mistake.
export function keepValues(action: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}

type FieldProps = {
  label: string;
  name: string;
  errors?: Record<string, string>;
  hint?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: string;
  inputMode?: "numeric" | "decimal" | "tel" | "email" | "url";
  /** Set for a multi-line box. */
  rows?: number;
  /** Needed when the same field name appears in several forms. */
  idPrefix?: string;
  className?: string;
};

export function Field({ label, name, errors, hint, defaultValue, rows, idPrefix = "f", className = "", ...input }: FieldProps) {
  const id = `${idPrefix}-${name}`;
  const error = errors?.[name];
  const shared = {
    id,
    name,
    defaultValue: defaultValue ?? "",
    className: inputStyle,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined,
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {input.required && <span aria-hidden="true"> *</span>}
      </label>
      {rows ? <textarea {...shared} rows={rows} required={input.required} /> : <input {...shared} {...input} />}
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-plum/75">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-red-800">{error}</p>}
    </div>
  );
}

export function Message({ state }: { state: FormState | { ok?: boolean; message?: string } }) {
  return (
    <p role="status" className={`font-semibold empty:hidden ${state.ok ? "text-green-800" : "text-red-800"}`}>
      {state.message}
    </p>
  );
}
