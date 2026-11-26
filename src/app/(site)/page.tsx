import { AboutPillars } from "@/components/home/about-pillars";
import { BuiltFramework } from "@/components/home/built-framework";
import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturedEvent } from "@/components/home/featured-event";
import { Hero } from "@/components/home/hero";
import { Outcomes } from "@/components/home/outcomes";
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
  return (
    <>
      <Hero hasEvent={hasEvent} />
      <FeaturedEvent event={event} unavailable={unavailable} />
      <AboutPillars />
      <BuiltFramework />
      <Outcomes />
      <ClosingCta hasEvent={hasEvent} />
    </>
  );
}
