// Server checks for the public registration form. Anyone can send anything here.
import { z } from "zod";
import { MINIMUM_AGE, OUTSIDE_NIGERIA, stateOptions } from "@/lib/locations";

const place = (max: number) =>
  z.string().transform((v) => v.trim().replace(/\s+/g, " ")).pipe(
    z.string().max(max, "This is too long.").regex(/^[^\p{Cc}<>]*$/u, "Remove unusual characters."),
  );

export const registrationSchema = z.object({
  /** Made when the form is shown, so sending it twice creates one registration. */
  submissionId: z.uuid("Please reload the page and try again."),
  fullName: z.string().transform((v) => v.trim().replace(/\s+/g, " ")).pipe(
    z.string().min(2, "Enter your full name.").max(120, "Name is too long.")
      .regex(/^[^\p{Cc}<>]+$/u, "Remove unusual characters from your name.")
      .refine((v) => !/https?:|www\./i.test(v), "Enter your name only."),
  ),
  email: z.string().trim().toLowerCase().max(200, "Email address is too long.").pipe(z.email("Enter a valid email address.")),
  phone: z.string().trim().max(25, "Phone number is too long.")
    .refine((v) => /^\+?[0-9 ()-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15,
      "Enter a valid phone number, e.g. 0801 234 5678 or +234 801 234 5678."),
  state: z.enum(stateOptions, "Choose where you are coming from."),
  city: place(80),
  country: place(80),
  ageConfirmed: z.literal(true, `You must be ${MINIMUM_AGE} or older to register.`),
  ticketId: z.uuid("Choose a registration option."),
  /** The price the visitor saw. */
  shownAmount: z.string().regex(/^\d{0,15}$/).transform(Number),
  privacyConsent: z.literal(true, "Please agree to the privacy notice to register."),
  marketingConsent: z.boolean(),
}).superRefine((v, ctx) => {
  if (v.state === OUTSIDE_NIGERIA && v.country.length < 2) {
    ctx.addIssue({ code: "custom", path: ["country"], message: "Enter your country." });
  }
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
