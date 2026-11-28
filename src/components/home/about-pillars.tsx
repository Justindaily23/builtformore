import Link from "next/link";
import { Container } from "@/components/ui/container";
import { pillars } from "@/content/home";

const accents = ["border-rose", "border-rose-deep", "border-gold", "border-rose", "border-rose-deep"];

export function AboutPillars({ intro }: { intro: string }) {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl leading-tight text-balance sm:text-5xl">You were built to grow, lead and make an impact</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed wrap-anywhere">{intro}</p>
          <Link href="/about" className="mt-3 inline-block py-2 font-semibold underline underline-offset-4">More about us</Link>
        </div>
        <h3 className="mt-12 font-display text-2xl">Our five core pillars</h3>
        <ul className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {pillars.map((p, i) => (
            <li key={p.title} className={`border-t-4 pt-5 ${accents[i]}`}>
              <h4 className="font-display text-2xl">{p.title}</h4>
              <p className="mt-3 max-w-prose leading-relaxed">{p.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
