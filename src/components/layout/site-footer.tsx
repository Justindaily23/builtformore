import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { brand, company } from "@/content/brand";
import { contactDetails } from "@/lib/contact-links";
import { getSiteContent } from "@/server/public/content";
import { footerLinks } from "./nav-links";

export async function SiteFooter() {
  const content = await getSiteContent();
  const [email, phone, , address] = contactDetails(content, brand.contact);
  const link = "inline-block py-2 text-ivory/80 hover:text-ivory hover:underline";
  return (
    <footer className="bg-plum-950 text-ivory">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1.4fr_1fr]">
        <div className="md:col-span-2 lg:col-span-1">
          <div className="inline-block rounded-2xl bg-white p-3">
            <Image src="/brand/logo-full.png" alt={brand.name} width={914} height={560} className="h-auto w-52" />
          </div>
          <p className="mt-4 font-semibold">{company.legalName}</p>
          <p className="mt-1 font-display text-xl text-gold-light wrap-anywhere">{content.tagline}</p>
          <p className="mt-3 max-w-sm text-ivory/80 wrap-anywhere">{content.footerStatement}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="font-display text-xl">Quick links</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6">
            {footerLinks.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-xl">Contact</h2>
          <ul className="mt-3 space-y-3 text-ivory/80 wrap-anywhere">
            {[email, phone, address].map(({ label, text, href }) => (
              <li key={label}>{href ? <a href={href} className="underline underline-offset-4">{text}</a> : text}</li>
            ))}
            <li>{content.website}</li>
          </ul>
          <p className="mt-5 text-sm text-ivory/80">Flagship programme: {company.flagship}</p>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-ivory/15 py-6 text-sm text-ivory/75 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
        <p className="flex gap-5">
          <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>
          <Link href="/terms" className="underline underline-offset-4">Terms &amp; Conditions</Link>
        </p>
      </Container>
    </footer>
  );
}
