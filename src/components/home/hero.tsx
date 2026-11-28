import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { brand } from "@/content/brand";
import type { SiteContent } from "@/content/editable";

// Each line is one step higher and further right: the "rising" idea.
const steps = [
  { offset: "mr-[12%]", bar: "bg-rose" },
  { offset: "ml-[12%]", bar: "bg-gold" },
];

export function Hero({ hasEvent, content }: { hasEvent: boolean; content: SiteContent }) {
  return (
    <section id="top" className="overflow-hidden bg-plum text-ivory">
      <Container className="grid gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16 lg:pt-24 lg:pb-28">
        <h1 className="font-display text-[clamp(1.75rem,8.4vw,4rem)] leading-[1.1] lg:text-[clamp(2.75rem,4.6vw,3.75rem)]">
          <span className="sr-only">{brand.name}: </span>
          <span className="flex flex-col">
            {[content.headline1, content.headline2].map((line, i) => (
              <span key={i} className={`rise block ${steps[i % steps.length].offset}`} style={{ animationDelay: `${i * 160}ms` }}>
                <span className="block pb-3 wrap-anywhere">{line}</span>
                <span className={`block h-1.5 sm:h-2 ${steps[i % steps.length].bar}`} aria-hidden="true" />
              </span>
            ))}
          </span>
        </h1>
        <div className="max-w-md">
          <p className="font-display text-2xl text-gold-light">A platform for women</p>
          <p className="mt-4 text-lg leading-relaxed text-ivory/90 wrap-anywhere">{content.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {hasEvent && <ButtonLink href="#event">See the next event</ButtonLink>}
            <ButtonLink href="/about" variant="outline">
              Discover the brand
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
