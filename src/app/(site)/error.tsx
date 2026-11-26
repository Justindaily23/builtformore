"use client";

import { Container } from "@/components/ui/container";

export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-20">
      <h1 className="font-display text-4xl">This page couldn&apos;t load</h1>
      <p className="mt-3 text-lg">Please try again in a moment.</p>
      <button type="button" onClick={() => retry()} className="mt-6 min-h-12 rounded-full bg-plum px-7 font-semibold text-ivory">
        Try again
      </button>
    </Container>
  );
}
