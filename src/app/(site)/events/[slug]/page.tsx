import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventPhoto } from "@/components/events/event-photo";
import { Schedule } from "@/components/events/schedule";
import { PersonPhoto } from "@/components/ui/person-photo";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { brand } from "@/content/brand";
import { formatDateRange } from "@/lib/format";
import { imageVariant, isShowableImage } from "@/lib/images";
import { formatNaira } from "@/lib/money";
import { registrationText } from "@/lib/registration-text";
import { roleNames } from "@/lib/speaker-roles";
import { getPublishedEvent } from "@/server/public/events";
import { getRegistrationInfo } from "@/server/public/registration";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getPublishedEvent((await params).slug);
  if (!event) return { title: "Event not found" };
  const url = `/events/${event.slug}`;
  const description = event.summary;
  // The picture WhatsApp and social sites show with a shared link.
  const picture = isShowableImage(event.imageUrl)
    ? [{ url: imageVariant(event.imageUrl, "b_white,c_pad,h_630,w_1200"), alt: event.imageAlt ?? event.title }]
    : undefined;
  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: event.title, description, url, siteName: brand.name, locale: "en_NG", type: "website", images: picture },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-plum/20 py-8">
      <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
      <div className="mt-4 leading-relaxed wrap-anywhere">{children}</div>
    </section>
  );
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const event = await getPublishedEvent((await params).slug);
  if (!event) notFound();

  const registration = event.ended ? null : await getRegistrationInfo(event.slug);
  const statusLabel =
    !registration ? "This event has ended"
    : registration.state === "full" ? "Registration is full"
    : registrationText[registration.state];
  const canRegister = registration?.state === "open";

  const deadline =
    event.registrationDeadline && registration && registration.state !== "closed"
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: event.timezone }).format(event.registrationDeadline)
      : null;
  const contacts = [
    { label: "Email", value: event.contactEmail },
    { label: "Phone", value: event.contactPhone },
    { label: "WhatsApp", value: event.contactWhatsapp },
  ].filter((c) => c.value);

  // With little information (common for old events), use one column instead of two.
  const showPhoto = Boolean(event.imageUrl) || !event.ended;
  const hasBody = Boolean(
    showPhoto || event.description || event.audience || event.accessibilityNotes ||
    event.people.length || event.schedule || event.tickets.length || contacts.length,
  );

  return (
    <article>
      <header className="bg-plum py-10 text-ivory sm:py-16">
        <Container>
          <Link href="/events" className="inline-block py-2 underline underline-offset-4">All events</Link>
          <p className="mt-5">
            <span className="inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-plum-950">
              {statusLabel}
            </span>
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-3xl leading-tight text-balance wrap-anywhere sm:text-5xl">{event.title}</h1>
          {event.theme && <p className="mt-4 font-display text-2xl text-gold-light wrap-anywhere">Theme: {event.theme}</p>}
          <p className="mt-4 max-w-2xl text-lg text-ivory/90 wrap-anywhere">{event.summary}</p>
          {canRegister && (
            <p className="mt-6">
              <ButtonLink href={`/events/${event.slug}/register`}>Register for this event</ButtonLink>
            </p>
          )}
        </Container>
      </header>

      <Container className={`grid gap-10 py-10 lg:items-start lg:py-14 ${hasBody ? "lg:grid-cols-[1fr_22rem]" : ""}`}>
        <aside className={`rounded-t-[5rem] bg-rose-light p-6 pt-10 lg:order-2 ${hasBody ? "" : "w-full max-w-md"}`} aria-label="Event information">
          <dl className="space-y-5 wrap-anywhere">
            <div>
              <dt className="text-sm text-plum/75">Dates</dt>
              <dd className="font-semibold">{formatDateRange(event.startDate, event.endDate)}</dd>
            </div>
            {(event.venue || event.address) && (
              <div>
                <dt className="text-sm text-plum/75">Venue</dt>
                <dd className="font-semibold">
                  {event.venue}
                  {event.address && <span className="block font-normal">{event.address}</span>}
                </dd>
                {event.mapUrl && (
                  <dd>
                    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-2 underline underline-offset-4">
                      Open map (new tab)
                    </a>
                  </dd>
                )}
              </div>
            )}
            {deadline && (
              <div>
                <dt className="text-sm text-plum/75">Registration deadline</dt>
                <dd className="font-semibold">{deadline}{event.timezone === "Africa/Lagos" ? " (Nigeria time)" : ""}</dd>
              </div>
            )}
          </dl>
        </aside>

        {hasBody && <div className="min-w-0 lg:order-1">
          {event.imageUrl?.startsWith("https://") && isShowableImage(event.imageUrl) ? (
            <div className="mb-8 overflow-hidden rounded-2xl bg-rose-light">
              <EventPhoto natural url={event.imageUrl} alt={event.imageAlt} sizes="(min-width: 1024px) 700px, 100vw" />
            </div>
          ) : showPhoto && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-rose">
              <EventPhoto url={event.imageUrl} alt={event.imageAlt} sizes="(min-width: 1024px) 700px, 100vw" />
            </div>
          )}
          {event.description && <Section title="About this event"><p className="max-w-prose whitespace-pre-line">{event.description}</p></Section>}
          {event.audience && <Section title="Who it is for"><p className="max-w-prose">{event.audience}</p></Section>}
          {event.people.length > 0 && (
            <Section title="Speakers and hosts">
              <ul className="grid gap-6 sm:grid-cols-2">
                {event.people.map((p) => (
                  <li key={p.key} className="border-l-4 border-gold pl-4">
                    <PersonPhoto url={p.photoUrl} name={p.name} className="mb-3 size-32" />
                    <h3 className="font-display text-xl">{p.name}</h3>
                    <p className="font-semibold text-rose-deep">{p.roles.map((role) => roleNames[role]).join(", ")}</p>
                    {p.professionalTitle && <p>{p.professionalTitle}</p>}
                    {p.bio && <p className="mt-2 whitespace-pre-line">{p.bio}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {event.schedule && (
            <Section title="Schedule">
              <Schedule note={event.schedule.note} days={event.schedule.days} />
            </Section>
          )}
          {event.tickets.length > 0 && (
            <Section title="Ticket options">
              <ul className="space-y-3">
                {event.tickets.map((t) => (
                  <li key={t.id} className="flex flex-col gap-2 rounded-xl border border-plum/20 bg-white p-4 sm:flex-row sm:justify-between sm:gap-6">
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      {t.description && <p className="mt-1">{t.description}</p>}
                    </div>
                    <p className="shrink-0 font-semibold">
                      {t.priceKobo === null ? "Price to be announced" : t.priceKobo === 0 ? "Free" : formatNaira(t.priceKobo)}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {canRegister && (
            <p className="mb-8">
              <ButtonLink href={`/events/${event.slug}/register`} variant="plum">Register for this event</ButtonLink>
            </p>
          )}
          {event.accessibilityNotes && <Section title="Accessibility"><p className="max-w-prose whitespace-pre-line">{event.accessibilityNotes}</p></Section>}
          {contacts.length > 0 && (
            <Section title="Questions about this event?">
              <dl className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.label} className="flex flex-wrap gap-x-3">
                    <dt className="font-semibold">{c.label}:</dt>
                    <dd>{c.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}
        </div>}
      </Container>
    </article>
  );
}
