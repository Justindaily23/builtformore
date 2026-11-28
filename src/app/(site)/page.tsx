import { AboutPillars } from "@/components/home/about-pillars";
import { BuiltFramework } from "@/components/home/built-framework";
import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturedEvent } from "@/components/home/featured-event";
import { Hero } from "@/components/home/hero";
import { Outcomes } from "@/components/home/outcomes";
import { Experiences } from "@/components/home/experiences";
import { toParagraphs } from "@/lib/content-text";
import { getSiteContent } from "@/server/public/content";
import { getFeaturedEvent } from "@/server/public/events";

// Read the database on each visit, never while building.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let event: Awaited<ReturnType<typeof getFeaturedEvent>> = null;
  let unavailable = false;
  try {
    event = await getFeaturedEvent();
  } catch (error) {
    // The brand content should still show if the database is unreachable.
    console.error("Home page could not load the featured event:", error);
    unavailable = true;
  }
  const hasEvent = event !== null;
  const content = await getSiteContent();
  return (
    <>
      <Hero hasEvent={hasEvent} content={content} />
      <FeaturedEvent event={event} unavailable={unavailable} />
      <AboutPillars intro={toParagraphs(content.aboutUs)[0] ?? ""} />
      <BuiltFramework />
      <Outcomes promise={content.promise} />
      <Experiences />
      <ClosingCta hasEvent={hasEvent} />
    </>
  );
}
