import type { Brand } from "@/types/content";

// ORIGINAL brand wording from "Website Branding & Positioning". Most of it can be
// changed in the admin panel (see editable.ts). `contact` holds the text shown
// while a contact has not been added.
export const brand: Brand = {
  name: "Built for More",
  descriptor: "More Within You. More Ahead.",
  headline: ["More Within You.", "More Ahead."],
  promise: "Every woman should leave better equipped for what comes next.",
  intro:
    "A purpose-driven personal development, leadership and empowerment platform that inspires women to recognise their potential, strengthen their capacity and translate growth into meaningful impact.",
  contact: {
    email: "Official email coming soon",
    phone: "Telephone coming soon",
    whatsapp: "WhatsApp number coming soon",
    location: "Office address coming soon",
  },
};

export const company = {
  legalName: "BUILT FOR MORE GLOBAL LIMITED",
  website: "www.builtformoreglobal.org",
  footerStatement:
    "Creating platforms that inspire growth, strengthen leadership, build capacity and unlock potential.",
  flagship: "BUILT FOR MORE Conference",
};
