import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Terms & Conditions", robots: { index: false } };

export default function TermsPage() {
  return (
    <Container className="max-w-2xl! py-12">
      <h1 className="font-display text-4xl">Terms &amp; Conditions</h1>
      <p className="mt-4 rounded-lg bg-gold-light p-4 font-semibold">
        Coming soon. The terms have not been written or approved yet.
      </p>
    </Container>
  );
}
