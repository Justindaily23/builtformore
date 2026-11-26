import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/registration/registration-form";
import { Container } from "@/components/ui/container";
import { formatDateRange } from "@/lib/format";
import { getRegistrationInfo } from "@/server/public/registration";

export const metadata: Metadata = { title: "Register", robots: { index: false } };

const closedText = {
  coming_soon: "Registration opens soon. Please check back.",
  closed: "Registration is closed.",
  full: "Registration is full. There are no places left.",
};

export default async function RegisterPage({ params }: PageProps<"/events/[slug]/register">) {
  const info = await getRegistrationInfo((await params).slug);
  if (!info) notFound();

  return (
    <>
      <header className="bg-plum py-8 text-ivory sm:py-12">
        <Container className="max-w-2xl!">
          <Link href={`/events/${info.slug}`} className="inline-block py-2 underline underline-offset-4">Back to the event</Link>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Register</h1>
          <p className="mt-2 text-lg wrap-anywhere">{info.title}</p>
          <p className="text-ivory/85">{formatDateRange(info.startDate, info.endDate)}</p>
        </Container>
      </header>
      <Container className="max-w-2xl! py-10">
        {info.state === "open" ? (
          <RegistrationForm slug={info.slug} submissionId={crypto.randomUUID()} tickets={info.tickets} />
        ) : (
          <p className="text-lg font-semibold">{closedText[info.state]}</p>
        )}
      </Container>
    </>
  );
}
