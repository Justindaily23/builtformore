// Turns saved contacts into what the pages show.
import type { SiteContent } from "@/content/editable";
import type { Brand } from "@/types/content";

export function contactDetails(content: SiteContent, comingSoon: Brand["contact"]) {
  const { email, phone, whatsapp, address } = content;
  const digits = (v: string) => v.replace(/[^\d]/g, "");
  return [
    { label: "Official email", text: email || comingSoon.email, href: email ? `mailto:${email}` : null },
    { label: "Telephone", text: phone || comingSoon.phone, href: /^\+?[\d\s()-]{7,}$/.test(phone) ? `tel:${phone.replace(/[^\d+]/g, "")}` : null },
    // wa.me needs the country code, so only numbers starting with + become links.
    { label: "WhatsApp", text: whatsapp || comingSoon.whatsapp, href: /^\+[\d\s()-]{7,}$/.test(whatsapp) ? `https://wa.me/${digits(whatsapp)}` : null },
    { label: "Office address", text: address || comingSoon.location, href: null },
  ];
}

export const socialLinks = (c: SiteContent) => [
  { name: "Instagram", url: c.instagram },
  { name: "Facebook", url: c.facebook },
  { name: "LinkedIn", url: c.linkedin },
  { name: "X", url: c.x },
  { name: "YouTube", url: c.youtube },
];
