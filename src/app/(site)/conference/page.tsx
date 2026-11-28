import type { Metadata } from "next";
import Link from "next/link";
import { SignatureExperiences } from "@/components/page/signature-experiences";
import { Band, Cards, PageHeader, Prose, TickList } from "@/components/page/parts";
import { ButtonLink } from "@/components/ui/button-link";
import { company } from "@/content/brand";
import { attendees, faculty } from "@/content/conference";
import { expectations } from "@/content/home";
import { toPairs, toParagraphs } from "@/lib/content-text";
import { getSiteContent } from "@/server/public/content";
import { getFeaturedEvent } from "@/server/public/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conference",
  description: `${company.flagship}: an annual gathering of women. A platform for growth. A movement towards impact.`,
  alternates: { canonical: "/conference" },
};

export default async function ConferencePage() {
  // The page still works if the database cannot be reached.
  const event = await getFeaturedEvent().catch((error) => {
    console.error("Conference page could not load the featured event:", error);
    return null;
  });
  const content = await getSiteContent();
  const eventLink = event ? `/events/${event.slug}` : "/events";

  return (
    <>
      <PageHeader title={company.flagship} strap="An annual gathering of women. A platform for growth. A movement towards impact." />
      <Band title="About the conference">
        <Prose paragraphs={toParagraphs(content.aboutConference)} />
        <p className="mt-6 max-w-2xl font-display text-2xl text-rose-deep">
          We believe that becoming more is not simply about what we achieve for ourselves, but also about what we make possible for others.
        </p>
        <div className="mt-8">
          <ButtonLink href={eventLink} variant="plum">
            {event?.registrationStatus === "open" ? "Register now and secure your seat" : "Dates, venue and registration"}
          </ButtonLink>
        </div>
      </Band>
      <Band id="theme" title={`${content.themeYear} theme: ${content.themeTitle}`} tone="rose">
        <Prose paragraphs={toParagraphs(content.themeOverview)} />
        <h3 className="mt-10 mb-6 font-display text-2xl">Conference subthemes</h3>
        <Cards items={toPairs(content.subthemes)} />
      </Band>
      <SignatureExperiences />
      <Band title="What to expect" tone="plum">
        <TickList items={expectations} />
      </Band>
      <Band id="attend" title="Who should attend?">
        <Prose paragraphs={[content.attendeesIntro, "The conference is particularly relevant to:"]} />
        <div className="mt-4"><TickList items={attendees.groups} /></div>
        <div className="mt-6"><Prose paragraphs={attendees.closing} /></div>
      </Band>
      <Band id="speakers" title="Speakers and faculty" tone="gold">
        <p className="mb-4 font-display text-xl">{faculty.strap}</p>
        <Prose paragraphs={faculty.intro} />
        <ul className="mt-6 flex flex-wrap gap-3">
          {faculty.community.map((c) => <li key={c} className="rounded-full bg-white px-5 py-2 font-semibold">{c}</li>)}
        </ul>
        <p className="mt-6">
          {event ? (
            <Link href={eventLink} className="inline-block py-2 font-semibold underline underline-offset-4">
              See announced speakers on the event page
            </Link>
          ) : "Speaker announcements are coming soon."}
        </p>
      </Band>
    </>
  );
}
