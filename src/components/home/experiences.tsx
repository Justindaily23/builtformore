import Link from "next/link";
import { Container } from "@/components/ui/container";
import { generations, hisAndHers } from "@/content/conference";

export function Experiences() {
  return (
    <section className="bg-rose-light py-16 sm:py-20">
      <Container>
        <h2 className="font-display text-4xl sm:text-5xl">Signature experiences</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {[generations, hisAndHers].map((x) => (
            <li key={x.title} className="rounded-t-[3rem] bg-white p-6 pt-8 sm:p-10">
              <h3 className="font-display text-3xl text-rose-deep">{x.title}</h3>
              <p className="mt-2 font-semibold">{x.strap}</p>
              <p className="mt-3 leading-relaxed">{x.text[0]}</p>
            </li>
          ))}
        </ul>
        <Link href="/conference#experiences" className="mt-6 inline-block py-2 font-semibold underline underline-offset-4">
          Explore our signature experiences
        </Link>
      </Container>
    </section>
  );
}
