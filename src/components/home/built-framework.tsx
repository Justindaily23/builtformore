import { Container } from "@/components/ui/container";
import { framework } from "@/content/home";

// On large screens each step sits a little higher than the one before it.
const lift = ["lg:min-h-80", "lg:min-h-[22rem]", "lg:min-h-96", "lg:min-h-[26rem]", "lg:min-h-[28rem]"];

export function BuiltFramework() {
  return (
    <section id="framework" className="bg-plum py-16 text-ivory sm:py-20 lg:py-28">
      <Container>
        <h2 className="font-display text-4xl sm:text-5xl">The BUILT journey</h2>
        <p className="mt-4 max-w-xl text-lg text-ivory/80">Five steps from knowing who you are to creating impact that lasts.</p>
        <ol className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
          {framework.map((step, i) => (
            <li
              key={step.letter}
              className={`flex gap-5 border-t-4 border-gold bg-ivory/[0.07] p-5 lg:flex-col lg:gap-0 ${lift[i]} ${i === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <span className="w-12 shrink-0 font-display text-6xl leading-none text-gold" aria-hidden="true">
                {step.letter}
              </span>
              <div className="lg:mt-auto lg:pt-8">
                <h3 className="font-display text-2xl">{step.word}</h3>
                <p className="mt-1 font-semibold text-rose-light">{step.focus}</p>
                <p className="mt-3 leading-relaxed text-ivory/80">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
