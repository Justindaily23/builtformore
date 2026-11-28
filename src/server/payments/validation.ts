import { z } from "zod";

export const bankTransferConfirmationSchema = z.object({
  bankReference: z.string().trim().min(1, "Bank transaction reference is required.")
    .max(120, "Bank transaction reference must be 120 characters or fewer."),
  note: z.string().trim().min(1, "Add a note about what you verified.")
    .max(1000, "The note must be 1,000 characters or fewer."),
  verified: z.boolean().refine(Boolean, "Confirm that you checked the transfer in the bank account."),
});

export type BankTransferConfirmation = z.infer<typeof bankTransferConfirmationSchema>;
