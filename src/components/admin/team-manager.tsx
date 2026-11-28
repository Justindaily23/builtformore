"use client";

import { useActionState } from "react";
import { deleteMemberAction, saveMemberAction } from "@/app/admin/(panel)/team/actions";
import { emptyState } from "@/lib/form-state";
import { ConfirmButton } from "./confirm-button";
import { Check, Field, Message, keepValues, primaryButton } from "./form-parts";
import { ImageUploader } from "./image-uploader";

export type Member = {
  id: string; name: string; position: string | null; bio: string | null; photoUrl: string | null;
  isFounder: boolean; isVisible: boolean; sortOrder: number;
};

const box = "rounded-xl border border-plum/20 bg-white p-4";

function MemberForm({ member, nextOrder }: { member?: Member; nextOrder: number }) {
  const [state, action, pending] = useActionState(saveMemberAction.bind(null, member?.id ?? null), emptyState);
  const idPrefix = member?.id ?? "new";
  const shared = { errors: state.errors, idPrefix };
  return (
    <div className="mt-4 space-y-3">
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="grid gap-4 md:grid-cols-2">
        <Field {...shared} label="Name" name="name" required defaultValue={member?.name} />
        <Field {...shared} label="Title or position" name="position" defaultValue={member?.position} />
        <Field {...shared} className="md:col-span-2" label="Biography" name="bio" rows={6} defaultValue={member?.bio} />
        <Field key={member ? "saved" : nextOrder} {...shared} label="Display order" name="sortOrder" inputMode="numeric" required
          defaultValue={member?.sortOrder ?? nextOrder} hint="Lower numbers appear first." />
        <div className="space-y-2 md:col-span-2">
          <Check name="isFounder" label="This is the Founder/Convener" checked={member?.isFounder ?? false}
            hint="Shown in the Founder section. Everyone else is shown under Leadership." />
          {state.errors?.isFounder && <p className="text-sm font-semibold text-red-800">{state.errors.isFounder}</p>}
          <Check name="isVisible" label="Show on the About page" checked={member?.isVisible ?? false}
            hint="Tick only when this person has approved their details." />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className={`w-full sm:w-auto ${primaryButton}`}>
            {pending ? "Saving…" : member ? "Save person" : "Add person"}
          </button>
        </div>
      </form>
      <Message state={state} />
    </div>
  );
}

export function TeamManager({ members, uploadsReady }: { members: Member[]; uploadsReady: boolean }) {
  const nextOrder = Math.min(999, Math.max(0, ...members.map((m) => m.sortOrder)) + 1);
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id}>
            <details className={box}>
              <summary className="cursor-pointer py-1">
                <span className="font-semibold wrap-anywhere">{m.name}</span>
                <span className="mt-1 block text-sm">{m.isFounder ? "Founder" : "Leadership"}, {m.isVisible ? "shown to visitors" : "hidden"}</span>
              </summary>
              <MemberForm member={m} nextOrder={nextOrder} />
              <div className="mt-5 space-y-4 border-t border-plum/15 pt-4">
                <ImageUploader target={{ type: "team", memberId: m.id }} url={m.photoUrl} ready={uploadsReady}
                  idPrefix={`photo-${m.id}`} label={`Photo of ${m.name}`}
                  hint="A clear head-and-shoulders photo works best; it is cropped to a square. Only upload photos you have permission to publish." />
                <ConfirmButton label="Delete this person" busyLabel="Deleting…"
                  question={`Delete ${m.name}'s details and photo?`} run={() => deleteMemberAction(m.id)} />
              </div>
            </details>
          </li>
        ))}
      </ul>
      {members.length === 0 && <p>No one has been added yet. The About page shows “coming soon”.</p>}
      <details className={`${box} border-dashed`}>
        <summary className="cursor-pointer py-1 font-semibold">Add a person</summary>
        <p className="mt-2 text-sm">Add the person first. Then open their name above to upload a photo.</p>
        <MemberForm nextOrder={nextOrder} />
      </details>
    </div>
  );
}
