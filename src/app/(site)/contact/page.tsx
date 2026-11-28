import type { Metadata } from "next";
import { Band, PageHeader, Prose } from "@/components/page/parts";
import { brand } from "@/content/brand";
import { contactDetails, socialLinks } from "@/lib/contact-links";
import { getSiteContent } from "@/server/public/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Built for More about attending, speaking, sponsoring, partnering or media.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getSiteContent();
  const details = contactDetails(content, brand.contact);
  return (
    <>
      <PageHeader title="Let's connect" />
      <Band title="We would love to hear from you">
        <Prose paragraphs={[
          "Whether you are interested in attending, speaking, sponsoring, partnering or collaborating with BUILT FOR MORE, we would love to hear from you.",
          "For enquiries, partnerships, sponsorship opportunities, media engagements and general information, please reach out.",
        ]} />
      </Band>
      <Band title="Contact information" tone="rose">
        <dl className="grid gap-5 sm:grid-cols-2">
          {details.map(({ label, text, href }) => (
            <div key={label} className="border-t-4 border-gold pt-3 wrap-anywhere">
              <dt className="font-display text-xl">{label}</dt>
              <dd className="mt-1">
                {href ? <a href={href} className="inline-block py-2 underline underline-offset-4">{text}</a> : text}
              </dd>
            </div>
          ))}
        </dl>
      </Band>
      <Band title="Connect with us">
        <ul className="flex flex-wrap gap-3">
          {socialLinks(content).map((s) => (
            <li key={s.name}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-ivory">{s.name}</a>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-full border border-plum/30 px-5">{s.name}: coming soon</span>
              )}
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
