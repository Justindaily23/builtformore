import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda";
import "@fontsource-variable/figtree";
import { brand } from "@/content/brand";
import "./globals.css";

const title = `${brand.name} | ${brand.descriptor}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: title, template: `%s | ${brand.name}` },
  description: brand.intro,
  openGraph: { title, description: brand.intro, siteName: brand.name, locale: "en_NG", type: "website" },
};

export const viewport: Viewport = { themeColor: "#3d1838" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
