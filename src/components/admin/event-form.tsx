"use client";

import { useActionState, useEffect, useRef } from "react";
import { emptyState, type FormState } from "@/lib/form-state";
import { Field, Message, keepValues, primaryButton } from "./form-parts";

export type EventFormValues = Partial<Record<
  | "title" | "slug" | "theme" | "summary" | "description" | "startDate" | "endDate" | "venue" | "address"
  | "mapUrl" | "audience" | "accessibilityNotes" | "contactEmail" | "contactPhone" | "contactWhatsapp"
  | "capacity" | "registrationDeadline" | "onlineHoldMinutes" | "transferHoldHours",
  string | number | null
>>;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
      <legend className="px-1 font-display text-2xl">{title}</legend>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function EventForm({
  action,
  values,
  version,
  submitLabel,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: EventFormValues;
  version?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, emptyState);
  const form = useRef<HTMLFormElement>(null);
  const errors = state.errors;
  const wide = "md:col-span-2";

  // Take the admin to the first mistake.
  useEffect(() => {
    form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  return (
    // The key refreshes the fields with the saved values after each save.
    <form key={state.saved} ref={form} method="post" onSubmit={keepValues(formAction)} noValidate className="space-y-6">
      {version && <input type="hidden" name="version" value={version} />}
      <p className="text-sm">Fields marked * are required.</p>

      <Group title="Basics">
        <Field className={wide} label="Event title" name="title" required defaultValue={values.title} errors={errors} />
        <Field
          className={wide} label="Web address" name="slug" defaultValue={values.slug} errors={errors}
          hint="The event's page: /events/your-web-address. Leave blank to create it from the title. Changing it later will break links already shared."
        />
        <Field label="Theme" name="theme" defaultValue={values.theme} errors={errors} />
        <Field label="Who it is for" name="audience" defaultValue={values.audience} errors={errors} />
        <Field className={wide} label="Short summary" name="summary" required rows={2} defaultValue={values.summary} errors={errors} />
        <Field className={wide} label="Full description" name="description" rows={6} defaultValue={values.description} errors={errors} />
      </Group>

      <Group title="Date and place">
        <Field label="Start date" name="startDate" type="date" required defaultValue={values.startDate} errors={errors} />
        <Field label="End date" name="endDate" type="date" required defaultValue={values.endDate} errors={errors} />
        <Field label="Venue" name="venue" defaultValue={values.venue} errors={errors} />
        <Field label="Address" name="address" defaultValue={values.address} errors={errors} />
        <Field className={wide} label="Map link" name="mapUrl" type="url" defaultValue={values.mapUrl} errors={errors} />
        <Field
          className={wide} label="Accessibility information" name="accessibilityNotes" rows={3}
          defaultValue={values.accessibilityNotes} errors={errors} hint="Only include support that has been confirmed."
        />
      </Group>

      <Group title="Contacts for this event">
        <p className={`${wide} -mb-2`}>Registration needs at least one of these.</p>
        <Field className={wide} label="Email" name="contactEmail" type="email" defaultValue={values.contactEmail} errors={errors} />
        <Field label="Phone" name="contactPhone" inputMode="tel" defaultValue={values.contactPhone} errors={errors} />
        <Field label="WhatsApp" name="contactWhatsapp" inputMode="tel" defaultValue={values.contactWhatsapp} errors={errors} />
      </Group>

      <Group title="Places and rules">
        <Field
          label="Total places" name="capacity" inputMode="numeric" defaultValue={values.capacity} errors={errors}
          hint="Leave blank for no limit."
        />
        <Field
          label="Registration deadline" name="registrationDeadline" type="datetime-local"
          defaultValue={values.registrationDeadline} errors={errors} hint="Optional. Nigeria time (WAT) unless the event uses another timezone."
        />
        <Field
          label="Hold for online payment (minutes)" name="onlineHoldMinutes" inputMode="numeric" required
          defaultValue={values.onlineHoldMinutes ?? 30} errors={errors} hint="How long an unpaid place is kept."
        />
        <Field
          label="Hold for bank transfer (hours)" name="transferHoldHours" inputMode="numeric" required
          defaultValue={values.transferHoldHours ?? 48} errors={errors}
        />
      </Group>

      <div className="space-y-3">
        <Message state={state} />
        <button type="submit" disabled={pending} className={`${primaryButton} w-full sm:w-auto`}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
