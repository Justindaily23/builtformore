"use client";

import { useState, useTransition } from "react";
import { changeStatusAction, type StatusChange } from "@/app/admin/(panel)/events/actions";
import { Message, primaryButton, secondaryButton } from "./form-parts";

export function StatusPanel({
  eventId,
  publishStatus,
  isFeatured,
  registrationStatus,
  openingProblems,
  privacyApproved,
}: {
  eventId: string;
  publishStatus: "draft" | "published" | "archived";
  isFeatured: boolean;
  registrationStatus: "coming_soon" | "open" | "closed";
  /** What still has to be done before registration can open. */
  openingProblems: string[];
  privacyApproved: boolean;
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
              onClick={() => change({ type: "publish", value: "archived" }, `Archive this event? It will be hidden from the website, including past events.${featuredWarning}`)}>
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
        {registrationStatus === "open" && openingProblems.length > 0 && (
          <p className="mt-1 font-semibold text-red-800">Visitors cannot register at the moment. See the list below.</p>
        )}
        <div className={buttons}>
          {registrationStatus !== "open" && (
            <button type="button" disabled={pending || openingProblems.length > 0} className={primaryButton}
              onClick={() => change({ type: "registration", value: "open" },
                `Open registration? People will be able to submit their personal details.${privacyApproved ? "" : " WARNING: the privacy notice is still a draft. Do not collect real people's details until it is approved."}`)}>
              Open registration
            </button>
          )}
          {(["coming_soon", "closed"] as const).map((value) => (
            <button key={value} type="button" disabled={pending || registrationStatus === value} className={secondaryButton}
              onClick={() => change({ type: "registration", value })}>
              {value === "coming_soon" ? "Set to coming soon" : "Set to closed"}
            </button>
          ))}
        </div>
        {openingProblems.length > 0 && (
          <div className="mt-3 rounded-lg bg-gold-light p-3 text-sm">
            <p className="font-semibold">Before registration can open:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {openingProblems.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        )}
      </div>

      <Message state={result} />
    </section>
  );
}
