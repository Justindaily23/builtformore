"use client";

import { useState, useTransition } from "react";
import { Message, secondaryButton } from "./form-parts";

/** A button that asks first (if given a question), then runs a server action. */
export function ConfirmButton({ label, busyLabel = "Working…", question, run, className = secondaryButton }: {
  label: string;
  busyLabel?: string;
  question?: string;
  run: () => Promise<{ ok: boolean; message: string }>;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok?: boolean; message?: string }>({});

  function click() {
    if (question && !window.confirm(question)) return;
    setResult({});
    startTransition(async () => {
      try {
        setResult(await run());
      } catch {
        setResult({ message: "We couldn't reach the server. Please try again." });
      }
    });
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={click} disabled={pending} className={`w-full sm:w-auto ${className}`}>
        {pending ? busyLabel : label}
      </button>
      <Message state={result} />
    </div>
  );
}
