import type { Metadata } from "next";
import { BuiltFramework } from "@/components/home/built-framework";
import { Band, Cards, PageHeader, Prose } from "@/components/page/parts";
import { philosophyLine, pillars, promiseText } from "@/content/home";
import { getSiteContent } from "@/server/public/content";

export const metadata: Metadata = {
  title: "Our Philosophy",
  description: "The five core pillars, the BUILT Framework and the Built for More promise.",
  alternates: { canonical: "/philosophy" },
};

export default async function PhilosophyPage() {
  const content = await getSiteContent();
  return (
    <>
      <PageHeader title="Our Philosophy" strap="Five interconnected areas of growth, development and impact." />
      <Band title="Five core pillars"><Cards items={pillars} /></Band>
      <BuiltFramework />
      <Band title="The BUILT philosophy" tone="gold">
        <p className="max-w-3xl font-display text-2xl leading-snug sm:text-3xl">{philosophyLine}</p>
      </Band>
      <Band title={content.promise}><Prose paragraphs={promiseText} /></Band>
    </>
  );
}
