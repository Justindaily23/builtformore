// Shared by public pages only. The admin panel will have its own layout.
import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { brand } from "@/content/brand";
import { getSiteContent } from "@/server/public/content";

// Saved wording must show at once, so these pages are built on each visit.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tagline, intro } = await getSiteContent();
  const title = `${brand.name} | ${tagline}`;
  return {
    title: { default: title, template: `%s | ${brand.name}` },
    description: intro,
    openGraph: { title, description: intro, siteName: brand.name, locale: "en_NG", type: "website" },
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-plum-950">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
