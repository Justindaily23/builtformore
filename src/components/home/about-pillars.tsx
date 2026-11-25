import { Container } from "@/components/ui/container";
import { brand } from "@/content/brand";
import { pillars } from "@/content/home";

const accents = ["border-rose", "border-rose-deep", "border-gold"];

export function AboutPillars() {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl leading-tight text-balance sm:text-5xl">You were built to grow, lead and make an impact</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            {brand.name} brings women together across generations, professions and nations to learn, build capacity, form
            meaningful connections and take purposeful steps towards their next level.
          </p>
        </div>
        <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:items-start">
          {pillars.map((p, i) => (
            <li
              key={p.title}
              className={`border-t-4 pt-5 ${accents[i]} ${i === 2 ? "md:col-span-2 lg:col-span-1" : ""} ${i === 0 ? "lg:mt-16" : ""} ${i === 1 ? "lg:mt-8" : ""}`}
            >
              <h3 className="font-display text-2xl">{p.title}</h3>
              <p className="mt-3 max-w-prose leading-relaxed">{p.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
