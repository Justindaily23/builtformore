"use client";

import { useActionState } from "react";
import { addExistingSpeakerAction, removeSpeakerAction, saveSpeakerAction } from "@/app/admin/(panel)/events/programme-actions";
import { emptyState } from "@/lib/form-state";
import { roleNames, speakerRoles, type SpeakerRole } from "@/lib/speaker-roles";
import { ConfirmButton } from "./confirm-button";
import { Check, Field, Message, Select, keepValues, primaryButton } from "./form-parts";

export type Appearance = {
  id: string;
  role: SpeakerRole;
  sortOrder: number;
  isVisible: boolean;
  name: string;
  professionalTitle: string | null;
  bio: string | null;
  /** True if this profile is also used elsewhere. */
  shared: boolean;
};

export type Profile = { id: string; name: string; professionalTitle: string | null };

const roleOptions = speakerRoles.map((value) => ({ value, label: roleNames[value] }));
const box = "rounded-xl border border-plum/20 bg-white p-4";

function Placement({ errors, idPrefix, appearance, nextOrder }: {
  errors?: Record<string, string>; idPrefix: string; appearance?: Appearance; nextOrder: number;
}) {
  return (
    <>
      <Select errors={errors} idPrefix={idPrefix} label="Role at this event" name="role"
        options={roleOptions} defaultValue={appearance?.role ?? "speaker"} />
      {/* The key updates a suggested number after something else is added. */}
      <Field key={appearance ? "saved" : nextOrder} errors={errors} idPrefix={idPrefix} label="Display order" name="sortOrder" inputMode="numeric" required
        defaultValue={appearance?.sortOrder ?? nextOrder} hint="Lower numbers appear first." />
      <div className="md:col-span-2">
        <Check name="isVisible" label="Show to visitors" checked={appearance?.isVisible ?? false}
          hint="Tick only when this person is confirmed and approved." />
      </div>
    </>
  );
}

function SpeakerForm({ eventId, appearance, nextOrder }: { eventId: string; appearance?: Appearance; nextOrder: number }) {
  const [state, action, pending] = useActionState(saveSpeakerAction.bind(null, eventId, appearance?.id ?? null), emptyState);
  const idPrefix = appearance?.id ?? "new";
  const shared = { errors: state.errors, idPrefix };
  return (
    <div className="mt-4 space-y-3">
      {appearance?.shared && (
        <p className="rounded-lg bg-gold-light p-3 text-sm">
          This person is listed more than once. Changes to the name, title and biography apply everywhere, including past events.
        </p>
      )}
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Field {...shared} label="Name" name="name" required defaultValue={appearance?.name} />
        <Field {...shared} label="Title or position" name="professionalTitle" defaultValue={appearance?.professionalTitle}
          hint="e.g. Managing Director, Example Ltd." />
        <Field {...shared} className="md:col-span-2" label="Short biography" name="bio" rows={4} defaultValue={appearance?.bio} />
        <Placement errors={state.errors} idPrefix={idPrefix} appearance={appearance} nextOrder={nextOrder} />
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className={`w-full sm:w-auto ${primaryButton}`}>
            {pending ? "Saving…" : appearance ? "Save person" : "Add person"}
          </button>
        </div>
      </form>
      <Message state={state} />
      {appearance && (
        <ConfirmButton label="Remove from event" busyLabel="Removing…"
          question={`Remove ${appearance.name} (${roleNames[appearance.role]}) from this event and its sessions?${appearance.shared ? "" : " Their saved details will be deleted."}`}
          run={() => removeSpeakerAction(eventId, appearance.id)} />
      )}
    </div>
  );
}

function ExistingForm({ eventId, profiles, nextOrder }: { eventId: string; profiles: Profile[]; nextOrder: number }) {
  const [state, action, pending] = useActionState(addExistingSpeakerAction.bind(null, eventId), emptyState);
  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Select errors={state.errors} idPrefix="existing" className="md:col-span-2" label="Person" name="speakerId"
          options={[{ value: "", label: "Choose a person" }, ...profiles.map((p) => ({
            value: p.id, label: p.professionalTitle ? `${p.name} (${p.professionalTitle})` : p.name,
          }))]} />
        <Placement errors={state.errors} idPrefix="existing" nextOrder={nextOrder} />
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className={`w-full sm:w-auto ${primaryButton}`}>
            {pending ? "Adding…" : "Add to event"}
          </button>
        </div>
      </form>
      <Message state={state} />
    </div>
  );
}

export function SpeakerManager({ eventId, appearances, profiles }: { eventId: string; appearances: Appearance[]; profiles: Profile[] }) {
  const nextOrder = Math.min(999, Math.max(0, ...appearances.map((a) => a.sortOrder)) + 1);
  return (
    <section aria-labelledby="speakers-title">
      <h2 id="speakers-title" className="font-display text-2xl">Speakers and convener</h2>
      <p className="mt-1">Hidden people do not appear anywhere on the website, including in the schedule.</p>

      <ul className="mt-4 space-y-3">
        {appearances.map((a) => (
          <li key={a.id}>
            <details className={box}>
              <summary className="cursor-pointer py-1">
                <span className="font-semibold wrap-anywhere">{a.name}</span>
                <span className="mt-1 block text-sm">{roleNames[a.role]}, {a.isVisible ? "shown to visitors" : "hidden"}</span>
              </summary>
              <SpeakerForm eventId={eventId} appearance={a} nextOrder={nextOrder} />
            </details>
          </li>
        ))}
      </ul>
      {appearances.length === 0 && <p className="mt-4">No one has been added to this event yet.</p>}

      <details className={`${box} mt-3 border-dashed`}>
        <summary className="cursor-pointer py-1 font-semibold">Add a new person</summary>
        <SpeakerForm eventId={eventId} nextOrder={nextOrder} />
      </details>
      {profiles.length > 0 && (
        <details className={`${box} mt-3 border-dashed`}>
          <summary className="cursor-pointer py-1 font-semibold">Add someone already saved</summary>
          <p className="mt-2 text-sm">Use this for a returning speaker, or to give someone a second role.</p>
          <ExistingForm eventId={eventId} profiles={profiles} nextOrder={nextOrder} />
        </details>
      )}
    </section>
  );
}
