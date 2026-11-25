import { AboutPillars } from "@/components/home/about-pillars";
import { BuiltFramework } from "@/components/home/built-framework";
import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturedEvent } from "@/components/home/featured-event";
import { Hero } from "@/components/home/hero";
import { Outcomes } from "@/components/home/outcomes";
import { featuredEvent } from "@/content/featured-event";

export default function HomePage() {
  const hasEvent = featuredEvent !== null;
  return (
    <>
      <Hero hasEvent={hasEvent} />
      <FeaturedEvent event={featuredEvent} />
      <AboutPillars />
      <BuiltFramework />
      <Outcomes />
      <ClosingCta hasEvent={hasEvent} />
    </>
  );
}
