import type { Metadata } from "next";
import { Band, Cards, PageHeader, Prose } from "@/components/page/parts";
import { TeamSections } from "@/components/page/team-sections";
import { brand, company } from "@/content/brand";
import { values } from "@/content/home";
import { toParagraphs } from "@/lib/content-text";
import { getSiteContent } from "@/server/public/content";
import { getVisibleTeam } from "@/server/public/team";

export const metadata: Metadata = {
  title: "About Us",
  description: `Who we are, our vision, mission and values at ${company.legalName}.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const team = await getVisibleTeam().catch((error) => {
    console.error("About page could not load the team:", error instanceof Error ? error.message.slice(0, 200) : "unknown error");
    return [];
  });
  return (
    <>
      <PageHeader title="About Us" strap={content.tagline} />
      <Band title="Who we are"><Prose paragraphs={toParagraphs(content.whoWeAre)} /></Band>
      <Band title={`About ${brand.name}`} tone="rose"><Prose paragraphs={toParagraphs(content.aboutUs)} /></Band>
      <Band title="Vision and mission">
        <div className="grid gap-8 lg:grid-cols-2">
          {[["Our vision", content.vision], ["Our mission", content.mission]].map(([title, text]) => (
            <div key={title} className="rounded-t-[4rem] bg-plum p-6 pt-10 text-ivory wrap-anywhere sm:p-10">
              <h3 className="font-display text-3xl text-gold-light">{title}</h3>
              <p className="mt-4 text-lg leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </Band>
      <Band title="Our core values" tone="gold"><Cards items={values} /></Band>
      <TeamSections team={team} founderIntro={toParagraphs(content.founderIntro)} leadershipIntro={toParagraphs(content.leadershipIntro)} />
    </>
  );
}
