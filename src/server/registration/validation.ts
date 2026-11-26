// Server checks for the public registration form. Anyone can send anything here.
import { z } from "zod";

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
  ticketId: z.uuid("Choose a registration option."),
  /** The price the visitor saw. */
  shownAmount: z.string().regex(/^\d{0,15}$/).transform(Number),
  privacyConsent: z.literal(true, "Please agree to the privacy notice to register."),
  marketingConsent: z.boolean(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
