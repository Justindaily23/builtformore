import { Container } from "@/components/ui/container";
import { brand } from "@/content/brand";
import { outcomes } from "@/content/home";

export function Outcomes() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <Container>
        <h2 className="max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl">{brand.promise}</h2>
        <p className="mt-5 max-w-xl text-lg">More than inspiration. This is what the gathering is designed to give you.</p>
        <ul className="mt-12 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
          {outcomes.map((o) => (
            <li key={o.title} className="border-t border-plum/20 py-6">
              <h3 className="font-display text-2xl text-rose-deep">{o.title}</h3>
              <p className="mt-2 leading-relaxed">{o.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
