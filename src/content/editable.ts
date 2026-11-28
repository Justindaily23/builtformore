// The list of website wording that can be changed in the admin panel.
// The ORIGINAL wording stays in src/content; the database stores only changes.
// To make another item editable: add it here, then read it where it is shown.
import { brand, company } from "./brand";
import { aboutConference, attendees, theme } from "./conference";
import { aboutUs, mission, vision, whoWeAre } from "./home";

export type FieldKind = "line" | "paragraphs" | "pairs" | "email" | "url";

export type EditableField = {
  key: string;
  label: string;
  kind: FieldKind;
  max: number;
  /** The original wording. Empty means "not provided yet". */
  original: string;
  hint?: string;
};

const joined = (list: string[]) => list.join("\n\n");

const field = <K extends string>(key: K, label: string, kind: FieldKind, max: number, original: string, hint?: string) =>
  ({ key, label, kind, max, original, hint });

export const contentGroups = [
  {
    id: "contacts",
    title: "Contacts and social accounts",
    about: "Shown in the footer and on the Contact page. A blank contact shows “coming soon”. Events keep their own contacts.",
    fields: [
      field("email", "Official email", "email", 200, ""),
      field("phone", "Telephone", "line", 60, ""),
      field("whatsapp", "WhatsApp number", "line", 60, "", "Start with the country code, e.g. +234, to make it a WhatsApp link."),
      field("address", "Office address", "line", 300, ""),
      field("website", "Website address", "line", 100, company.website),
      field("instagram", "Instagram link", "url", 300, "", "The full link, starting with https://"),
      field("facebook", "Facebook link", "url", 300, ""),
      field("linkedin", "LinkedIn link", "url", 300, ""),
      field("x", "X link", "url", 300, ""),
      field("youtube", "YouTube link", "url", 300, ""),
    ],
  },
  {
    id: "brand",
    title: "Home page and brand wording",
    about: "The large home page headline, tagline and introduction.",
    fields: [
      field("headline1", "Headline, first line", "line", 28, brand.headline[0]),
      field("headline2", "Headline, second line", "line", 28, brand.headline[1]),
      field("tagline", "Tagline", "line", 90, brand.descriptor),
      field("intro", "Introduction", "line", 400, brand.intro, "Also used by search engines and link previews."),
      field("promise", "Brand promise", "line", 160, brand.promise),
      field("footerStatement", "Footer statement", "line", 250, company.footerStatement),
    ],
  },
  {
    id: "about",
    title: "About page",
    about: "Leave an empty line between paragraphs. The first paragraph of “About Built for More” also appears on the home page.",
    fields: [
      field("whoWeAre", "Who we are", "paragraphs", 5000, joined(whoWeAre)),
      field("aboutUs", "About Built for More", "paragraphs", 5000, joined(aboutUs)),
      field("vision", "Vision", "line", 800, vision),
      field("mission", "Mission", "line", 800, mission),
      field("founderIntro", "Founder section introduction", "paragraphs", 2000,
        "BUILT FOR MORE is driven by a vision to create meaningful platforms that inspire women to recognise their potential, strengthen their capacity, embrace opportunities and make lasting contributions to society.",
        "Add the founder's name, photo and biography on the Team tab."),
      field("leadershipIntro", "Leadership section introduction", "paragraphs", 2000, joined([
        "BUILT FOR MORE is driven by individuals who share a commitment to purposeful growth, excellence, leadership and meaningful impact.",
        "Our leadership team brings together diverse experiences, professional expertise and a shared passion for creating opportunities for development, collaboration and transformation.",
      ]), "Add team members on the Team tab."),
    ],
  },
  {
    id: "conference",
    title: "Conference page",
    about: "Dates, venue, tickets, speakers and schedule are edited under Events. Update the theme here AND on the event when it changes.",
    fields: [
      field("aboutConference", "About the conference", "paragraphs", 5000, joined(aboutConference)),
      field("themeYear", "Theme year", "line", 4, String(theme.year)),
      field("themeTitle", "Theme", "line", 80, theme.title),
      field("themeOverview", "Theme overview", "paragraphs", 4000, joined(theme.overview)),
      field("subthemes", "Subthemes", "pairs", 2000, theme.subthemes.map((s) => `${s.title}: ${s.text}`).join("\n"),
        "One per line, written as “Title: short description”."),
      field("attendeesIntro", "Who should attend: first sentence", "line", 500, attendees.intro,
        "The age confirmation on the registration form does not change with this text."),
    ],
  },
] as const;

export type ContentGroupId = (typeof contentGroups)[number]["id"];
export type ContentKey = (typeof contentGroups)[number]["fields"][number]["key"];
export type SiteContent = Record<ContentKey, string>;

export const allFields = contentGroups.flatMap((g) => [...g.fields]);

export const originalContent = Object.fromEntries(allFields.map((f) => [f.key, f.original])) as SiteContent;
