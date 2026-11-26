"use client";

import { useState, useTransition } from "react";
import { changeStatusAction, type StatusChange } from "@/app/admin/(panel)/events/actions";
import { Message, primaryButton, secondaryButton } from "./form-parts";

export function StatusPanel({
  eventId,
  publishStatus,
  isFeatured,
  registrationStatus,
}: {
  eventId: string;
  publishStatus: "draft" | "published" | "archived";
  isFeatured: boolean;
  registrationStatus: "coming_soon" | "open" | "closed";
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok?: boolean; message?: string }>({});

  function change(next: StatusChange, question?: string) {
    if (question && !window.confirm(question)) return;
    setResult({});
    startTransition(async () => {
      try {
        setResult(await changeStatusAction(eventId, next));
      } catch {
        setResult({ message: "We couldn't reach the server. Check your connection and try again." });
      }
    });
  }

  const row = "border-t border-plum/15 py-4";
  const buttons = "mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap";
  const featuredWarning = isFeatured ? " It will also stop being the featured event." : "";

  return (
    <section aria-labelledby="status-title" className="rounded-2xl border border-plum/15 bg-white p-4 sm:p-6">
      <h2 id="status-title" className="font-display text-2xl">Status</h2>
      <p className="mt-1 mb-3 text-sm">These buttons apply immediately. Save any edits to the details first.</p>

      <div className={row}>
        <p className="font-semibold">
          {publishStatus === "published" ? "Published" : publishStatus === "draft" ? "Draft (hidden from visitors)" : "Archived (hidden from visitors)"}
        </p>
        <div className={buttons}>
          {publishStatus === "draft" && (
            <button type="button" disabled={pending} className={primaryButton}
              onClick={() => change({ type: "publish", value: "published" }, "Publish this event? Check the details are approved for the public.")}>
              Publish
            </button>
          )}
          {publishStatus === "published" && (
            <button type="button" disabled={pending} className={secondaryButton}
              onClick={() => change({ type: "publish", value: "draft" }, `Unpublish this event?${featuredWarning}`)}>
              Unpublish
            </button>
          )}
          {publishStatus !== "archived" ? (
            <button type="button" disabled={pending} className={secondaryButton}
              onClick={() => change({ type: "publish", value: "archived" }, `Archive this event?${featuredWarning}`)}>
              Archive
            </button>
          ) : (
            <button type="button" disabled={pending} className={secondaryButton}
              onClick={() => change({ type: "publish", value: "draft" })}>
              Restore as draft
            </button>
          )}
        </div>
      </div>

      <div className={row}>
        <p className="font-semibold">{isFeatured ? "This is the featured event" : "Not the featured event"}</p>
        <p className="text-sm">Only one published event can be featured. Choosing this one replaces any other.</p>
        <div className={buttons}>
          <button type="button" disabled={pending || publishStatus !== "published"} className={secondaryButton}
            onClick={() => change({ type: "featured", value: !isFeatured })}>
            {isFeatured ? "Stop featuring" : "Feature this event"}
          </button>
        </div>
        {publishStatus !== "published" && <p className="mt-2 text-sm">Publish the event first.</p>}
      </div>

      <div className={row}>
        <p className="font-semibold">
          Registration: {registrationStatus === "coming_soon" ? "Coming soon" : registrationStatus === "closed" ? "Closed" : "Open"}
        </p>
        <div className={buttons}>
          {(["coming_soon", "closed"] as const).map((value) => (
            <button key={value} type="button" disabled={pending || registrationStatus === value} className={secondaryButton}
              onClick={() => change({ type: "registration", value })}>
              {value === "coming_soon" ? "Set to coming soon" : "Set to closed"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm">Opening registration will be available once the registration form is built.</p>
      </div>

      <Message state={result} />
    </section>
  );
}
