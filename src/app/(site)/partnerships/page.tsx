import type { Metadata } from "next";
import { Band, PageHeader, Prose, TickList } from "@/components/page/parts";
import { ButtonLink } from "@/components/ui/button-link";
import { partnerships } from "@/content/partnerships";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "Sponsorship and partnership with Built for More.",
  alternates: { canonical: "/partnerships" },
};

export default function PartnershipsPage() {
  return (
    <>
      <PageHeader title="Sponsorship and partnerships" strap={partnerships.strap} />
      <Band title="Support a platform with purpose"><Prose paragraphs={partnerships.intro} /></Band>
      <Band title="We welcome collaborations with" tone="rose"><TickList items={partnerships.partners} /></Band>
      <Band title="Why partner with Built for More?"><TickList items={partnerships.reasons} /></Band>
      <Band title={partnerships.closing} tone="gold">
        <ButtonLink href="/contact" variant="plum">Contact us about partnership</ButtonLink>
      </Band>
    </>
  );
}
