"use client";

import { useActionState } from "react";
import { saveContentAction } from "@/app/admin/(panel)/content/actions";
import { contentGroups, type ContentGroupId, type SiteContent } from "@/content/editable";
import { emptyState } from "@/lib/form-state";
import { Field, Message, keepValues, primaryButton } from "./form-parts";

export function ContentForm({ groupId, values, version }: { groupId: ContentGroupId; values: Partial<SiteContent>; version: string }) {
  const [state, action, pending] = useActionState(saveContentAction.bind(null, groupId), emptyState);
  const group = contentGroups.find((g) => g.id === groupId)!;
  return (
    <div className="mt-4 space-y-3">
      <p>{group.about}</p>
      <form key={state.saved} method="post" onSubmit={keepValues(action)} noValidate className="space-y-4">
        <input type="hidden" name="version" value={version} />
        {group.fields.map((f) => {
          const long = f.kind === "paragraphs" || f.kind === "pairs" || f.max > 200 && f.kind === "line";
          const restore = f.original ? "Clear the box and save to restore the original wording." : "";
          return (
            <Field key={f.key} idPrefix={groupId} errors={state.errors} label={f.label} name={f.key} defaultValue={values[f.key]}
              rows={long ? (f.kind === "line" ? 3 : 9) : undefined}
              hint={[("hint" in f ? f.hint : undefined), restore].filter(Boolean).join(" ") || undefined} />
          );
        })}
        <button type="submit" disabled={pending} className={`w-full sm:w-auto ${primaryButton}`}>
          {pending ? "Saving…" : "Save this section"}
        </button>
      </form>
      <Message state={state} />
    </div>
  );
}
