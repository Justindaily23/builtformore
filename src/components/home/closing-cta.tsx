import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function ClosingCta({ hasEvent }: { hasEvent: boolean }) {
  return (
    <section className="bg-gold-light py-16 sm:py-20 [&_:focus-visible]:outline-plum">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
            Becoming more is also about what you make possible for others
          </h2>
        </div>
        {hasEvent && (
          <div className="flex shrink-0 flex-col sm:flex-row">
            <ButtonLink href="#event" variant="plum">
              See the next event
            </ButtonLink>
          </div>
        )}
      </Container>
    </section>
  );
}
