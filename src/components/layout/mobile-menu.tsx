"use client";

// A Client Component because it needs state and click handlers.
import { useEffect, useRef, useState } from "react";
import { navLinks } from "./nav-links";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-plum/40 px-4 text-sm font-semibold"
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-plum/15 bg-white shadow-xl"
      >
        <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
          {navLinks.map((link) => (
            <li key={link.href} className="border-b border-plum/10 last:border-0">
              <a href={link.href} onClick={() => setOpen(false)} className="block py-4 text-lg">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
