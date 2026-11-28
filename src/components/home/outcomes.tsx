import { TickList } from "@/components/page/parts";
import { Container } from "@/components/ui/container";
import { expectations } from "@/content/home";

export function Outcomes({ promise }: { promise: string }) {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <Container>
        <h2 className="max-w-3xl font-display text-4xl leading-tight text-balance wrap-anywhere sm:text-5xl">{promise}</h2>
        <p className="mt-5 mb-8 max-w-xl text-lg">More than inspiration. At the conference, you can expect:</p>
        <TickList items={expectations} />
      </Container>
    </section>
  );
}
