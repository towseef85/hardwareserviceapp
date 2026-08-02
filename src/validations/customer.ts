import { z } from "zod";

export const customerSchema = z.object({
  storeId: z.string().trim().regex(/^\d+$/, "Select a valid Store."),
  fullName: z.string().trim().min(1, "Full name is required.").max(150),
  mobile: z.string().trim().min(1, "Mobile is required.").max(30),
  email: z.union([
    z.literal(""),
    z.string().trim().max(255).email("Enter a valid email address."),
  ]),
  address: z.string().trim().max(1000),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
