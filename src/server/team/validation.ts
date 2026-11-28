import { z } from "zod";

const optional = (max: number) =>
  z.string().trim().max(max, `Too long (maximum ${max} characters).`).transform((v) => v || null);

export const memberSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long (maximum 120 characters)."),
  position: optional(200),
  bio: optional(3000),
  sortOrder: z.string().trim().regex(/^\d{1,3}$/, "Enter a whole number from 0 to 999.").transform(Number),
  isFounder: z.boolean(),
  isVisible: z.boolean(),
});

export type MemberInput = z.infer<typeof memberSchema>;
