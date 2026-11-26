"use client";

// Shown if an admin page or action fails unexpectedly.
export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">That didn&apos;t work</h1>
      <p className="mt-3">Check your connection and try again. If you were saving, check whether the change was saved.</p>
      <button type="button" onClick={() => retry()} className="mt-5 min-h-12 rounded-full bg-plum px-6 font-semibold text-ivory">
        Try again
      </button>
    </div>
  );
}
