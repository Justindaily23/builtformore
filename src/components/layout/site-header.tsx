import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/content/brand";
import { MobileMenu } from "./mobile-menu";
import { navLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ivory/10 bg-plum text-ivory">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/#top" className="py-2">
          <Logo name={brand.name} />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="py-3 text-ivory/85 underline-offset-8 hover:text-ivory hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu />
      </Container>
    </header>
  );
}
