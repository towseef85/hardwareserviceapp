import { z } from "zod";

export const serviceTypeSchema = z.object({
  storeId: z.string().trim().regex(/^\d+$/, "Select a valid Store."),
  name: z.string().trim().min(1, "Name is required.").max(150),
  isActive: z.boolean(),
  description: z.string().trim().max(1000),
});

export type ServiceTypeFormValues = z.infer<typeof serviceTypeSchema>;
