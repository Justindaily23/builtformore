"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

const field =
  "mt-2 block min-h-12 w-full rounded-lg border border-plum/50 bg-white px-4 text-base text-plum";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);

    try {
      const { error } = await authClient.signIn.email({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      });
      if (!error) {
        // A full page load, so nothing from a previous login is reused.
        window.location.replace("/admin");
        return;
      }
      setError(
        error.status === 429
          ? "Too many attempts. Wait a minute, then try again."
          : error.status === 403
            ? "Sign in was blocked. Check that you are using the correct site address."
            : error.status >= 500
              ? "Login is not working right now. Please try again shortly."
              : "We couldn't sign you in. Check your email and password.",
      );
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  // method="post" keeps the password out of the address bar if the form is
  // submitted before the page has finished loading.
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-5">
      <label className="block font-semibold">
        Email address
        <input name="email" type="email" autoComplete="username" required className={field} />
      </label>
      <div>
        <label htmlFor="password" className="font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          className={field}
        />
        <label className="mt-2 flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="size-5 accent-plum"
          />
          Show password
        </label>
      </div>
      <p role="alert" className="font-semibold text-red-800 empty:hidden">
        {error}
      </p>
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-full bg-plum px-6 font-semibold text-ivory hover:bg-plum-950 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
