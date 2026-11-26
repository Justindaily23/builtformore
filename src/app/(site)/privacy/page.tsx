import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { privacyNotice } from "@/content/privacy";

export const metadata: Metadata = { title: "Privacy notice", robots: { index: privacyNotice.approved } };

export default function PrivacyPage() {
  return (
    <Container className="max-w-2xl! py-12">
      <h1 className="font-display text-4xl">Privacy notice</h1>
      {!privacyNotice.approved && (
        <p className="mt-4 rounded-lg bg-gold-light p-4 font-semibold">
          Draft: this notice is awaiting review and is not final.
        </p>
      )}
      {privacyNotice.sections.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="font-display text-2xl">{section.title}</h2>
          <p className="mt-2 leading-relaxed">{section.body}</p>
        </section>
      ))}
      <p className="mt-10 text-sm">Version: {privacyNotice.version}</p>
    </Container>
  );
}
