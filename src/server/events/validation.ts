// Checks everything an admin submits. The browser's own checks are only a
// convenience: these run on the server.
import { z } from "zod";
import { nairaToKobo } from "@/lib/money";

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long (maximum ${max} characters).`);

/** Empty text is stored as null, meaning "not provided". */
const optional = (max: number) =>
  z.string().trim().max(max, `Too long (maximum ${max} characters).`).transform((v) => v || null);

const isRealDate = (v: string) => {
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
};
const day = (label: string) =>
  z.string().regex(/^20\d{2}-\d{2}-\d{2}$/, `${label} is required.`).refine(isRealDate, `${label} is not a real date.`);

const wholeNumber = (min: number, max: number) =>
  z.string().trim().regex(/^\d+$/, "Enter a whole number.").transform(Number)
    .pipe(z.number().min(min, `Must be at least ${min}.`).max(max, `Must be ${max.toLocaleString("en-NG")} or less.`));

/** Blank means no limit. */
const optionalLimit = z.union([z.literal("").transform(() => null), wholeNumber(1, 100_000)]);

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
}

export const eventSchema = z
  .object({
    title: required("Title", 150),
    slug: z.string().trim().toLowerCase().max(80, "Maximum 80 characters."),
    theme: optional(150),
    summary: required("Short summary", 300),
    description: optional(5000),
    startDate: day("Start date"),
    endDate: day("End date"),
    venue: optional(200),
    address: optional(300),
    mapUrl: z.string().trim().max(500, "Too long.")
      .refine((v) => !v || (/^https:\/\//i.test(v) && URL.canParse(v)), "Use a full link starting with https://")
      .transform((v) => v || null),
    audience: optional(500),
    accessibilityNotes: optional(1000),
    contactEmail: z.union([z.literal("").transform(() => null), z.string().trim().max(200).pipe(z.email("Enter a valid email address."))]),
    contactPhone: optional(40),
    contactWhatsapp: optional(40),
    capacity: optionalLimit,
    registrationDeadline: z.string().regex(/^(|20\d{2}-\d{2}-\d{2}T\d{2}:\d{2})$/, "Enter a valid date and time.")
      .refine((v) => !v || (isRealDate(v.slice(0, 10)) && /T([01]\d|2[0-3]):[0-5]\d$/.test(v)), "Enter a valid date and time."),
    onlineHoldMinutes: wholeNumber(5, 1440),
    transferHoldHours: wholeNumber(1, 720),
  })
  .transform((v) => ({ ...v, slug: v.slug || slugify(v.title) }))
  .superRefine((v, ctx) => {
    if (!slugPattern.test(v.slug)) {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use lowercase letters, numbers and single hyphens, e.g. annual-summit-2028." });
    }
    // "new" is a page address in the admin panel and could cause confusion.
    if (v.slug === "new") ctx.addIssue({ code: "custom", path: ["slug"], message: "Choose a different web address." });
    if (v.startDate && v.endDate && v.endDate < v.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be before the start date." });
    }
  });

export type EventInput = z.infer<typeof eventSchema>;

export const ticketSchema = z.object({
  name: required("Name", 100),
  description: optional(500),
  price: z.string().transform((v, ctx) => {
    const kobo = nairaToKobo(v);
    if (kobo === null) {
      ctx.addIssue({ code: "custom", message: "Enter an amount in naira, e.g. 200000 or 200,000. Use 0 for free." });
      return z.NEVER;
    }
    return kobo;
  }),
  capacity: optionalLimit,
  sortOrder: wholeNumber(0, 999),
  isActive: z.boolean(),
  showPrice: z.boolean(),
});

export type TicketInput = z.infer<typeof ticketSchema>;

export const registrationChoice = z.enum(["coming_soon", "open", "closed"]);

export const paymentInstructionsSchema = z.object({ paymentInstructions: optional(1500) });
export const publishChoice = z.enum(["draft", "published", "archived"]);
