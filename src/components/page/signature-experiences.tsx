import { generations, hisAndHers } from "@/content/conference";
import { Band, Prose } from "./parts";

export function SignatureExperiences() {
  return (
    <Band id="experiences" title="Signature experiences">
      <div className="space-y-12">
        <article>
          <h3 className="font-display text-3xl text-rose-deep">{generations.title}</h3>
          <p className="mt-2 mb-4 font-semibold">{generations.strap}</p>
          <Prose paragraphs={generations.text} />
        </article>
        <article>
          <h3 className="font-display text-3xl text-rose-deep">{hisAndHers.title}</h3>
          <p className="mt-2 mb-4 font-semibold">{hisAndHers.strap}</p>
          <Prose paragraphs={hisAndHers.text} />
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {hisAndHers.dimensions.map((d) => (
              <li key={d.title} className="rounded-t-[3rem] bg-rose-light p-6 pt-8">
                <h4 className="font-display text-2xl">{d.title}</h4>
                <p className="mt-2">{d.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6"><Prose paragraphs={[hisAndHers.closing]} /></div>
          <p className="mt-4 max-w-2xl text-sm">{hisAndHers.note}</p>
        </article>
      </div>
    </Band>
  );
}
