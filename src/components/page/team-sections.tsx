import { PersonPhoto } from "@/components/ui/person-photo";
import type { getVisibleTeam } from "@/server/public/team";
import { Band, Prose } from "./parts";

type Person = Awaited<ReturnType<typeof getVisibleTeam>>[number];

export function TeamSections({ team, founderIntro, leadershipIntro }: {
  team: Person[]; founderIntro: string[]; leadershipIntro: string[];
}) {
  const founder = team.find((p) => p.isFounder);
  const others = team.filter((p) => !p.isFounder);
  return (
    <>
      <Band id="founder" title="Meet the visionary behind Built for More">
        <Prose paragraphs={founderIntro} />
        {founder ? (
          <div className="mt-8 flex flex-col gap-6 wrap-anywhere md:flex-row md:items-start">
            <PersonPhoto url={founder.photoUrl} name={founder.name} className="w-full max-w-72" />
            <div className="max-w-2xl">
              <h3 className="font-display text-3xl">{founder.name}</h3>
              {founder.position && <p className="mt-1 font-semibold text-rose-deep">{founder.position}</p>}
              {founder.bio && <p className="mt-4 text-lg leading-relaxed whitespace-pre-line">{founder.bio}</p>}
            </div>
          </div>
        ) : <p className="mt-4 text-lg">The Founder/Convener&apos;s profile is coming soon.</p>}
      </Band>
      <Band id="leadership" title="The people behind the vision" tone="rose">
        <Prose paragraphs={leadershipIntro} />
        {others.length ? (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p, i) => (
              <li key={i} className="wrap-anywhere">
                <PersonPhoto url={p.photoUrl} name={p.name} className="mb-4 size-48 bg-white" />
                <h3 className="font-display text-2xl">{p.name}</h3>
                {p.position && <p className="font-semibold text-rose-deep">{p.position}</p>}
                {p.bio && <p className="mt-2 leading-relaxed whitespace-pre-line">{p.bio}</p>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-lg">Team profiles are coming soon.</p>}
      </Band>
    </>
  );
}
