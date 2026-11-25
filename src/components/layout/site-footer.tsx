import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/content/brand";
import { navLinks } from "./nav-links";

export function SiteFooter() {
  const { contact } = brand;
  return (
    <footer id="contact" className="bg-plum-950 text-ivory">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo name={brand.name} />
          <p className="mt-4 text-ivory/75">{brand.descriptor}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="font-display text-xl">Explore</h2>
          <ul className="mt-3">
            {navLinks.slice(0, 3).map((link) => (
              <li key={link.href}>
                <a href={link.href} className="inline-block py-2 text-ivory/75 hover:text-ivory">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-xl">Contact</h2>
          <ul className="mt-3 space-y-3 text-ivory/75 wrap-anywhere">
            <li>{contact.email}</li>
            <li>{contact.phone}</li>
            <li>{contact.whatsapp}</li>
            <li>{contact.location}</li>
          </ul>
        </div>
      </Container>
      <Container className="border-t border-ivory/15 py-6 text-sm text-ivory/65">
        © {brand.name}. All rights reserved.
      </Container>
    </footer>
  );
}
