"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");

  async function logOut() {
    setState("busy");
    try {
      const { error } = await authClient.signOut();
      if (!error) {
        window.location.replace("/admin/login");
        return;
      }
    } catch {
      // Handled below.
    }
    // Never suggest someone is logged out when they may not be.
    setState("failed");
  }

  return (
    <div className="flex items-center gap-3">
      {state === "failed" && (
        <p role="alert" className="text-sm text-rose-deep">
          Log out failed. Try again.
        </p>
      )}
      <button
        type="button"
        onClick={logOut}
        disabled={state === "busy"}
        className="min-h-11 rounded-full border border-plum/40 px-5 text-sm font-semibold hover:bg-plum/10 disabled:opacity-60"
      >
        {state === "busy" ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
