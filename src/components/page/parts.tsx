// Building blocks shared by the brand pages.
import { Container } from "@/components/ui/container";

export function PageHeader({ title, strap }: { title: string; strap?: string }) {
  return (
    <header className="bg-plum py-12 text-ivory sm:py-20">
      <Container>
        <h1 className="max-w-4xl font-display text-4xl leading-tight text-balance sm:text-6xl">{title}</h1>
        {strap && <p className="mt-4 max-w-2xl font-display text-xl text-gold-light sm:text-2xl">{strap}</p>}
      </Container>
    </header>
  );
}

const tones = { plain: "", rose: "bg-rose-light", plum: "bg-plum text-ivory", gold: "bg-gold-light" };

export function Band({ id, title, tone = "plain", children }: {
  id?: string; title: string; tone?: keyof typeof tones; children: React.ReactNode;
}) {
  return (
    <section id={id} className={`py-12 sm:py-16 lg:py-20 ${tones[tone]}`}>
      <Container>
        <h2 className="max-w-3xl font-display text-3xl leading-tight text-balance sm:text-4xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-2xl space-y-4 text-lg leading-relaxed wrap-anywhere">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

export function Cards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.title} className="border-t-4 border-gold pt-4 wrap-anywhere">
          <h3 className="font-display text-2xl">{item.title}</h3>
          <p className="mt-2 leading-relaxed">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export function TickList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-10 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 border-t border-current/20 py-4 leading-relaxed">
          <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rotate-45 bg-gold" />
          {item}
        </li>
      ))}
    </ul>
  );
}
