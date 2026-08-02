import { z } from "zod";

export const storeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Store code is required.")
    .max(30, "Store code cannot exceed 30 characters.")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Code can contain only letters, numbers, hyphens, and underscores.",
    ),

  engName: z
    .string()
    .trim()
    .min(1, "English name is required.")
    .max(150, "English name cannot exceed 150 characters."),

  arbName: z
    .string()
    .trim()
    .max(150, "Arabic name cannot exceed 150 characters."),

  cityId: z
    .string()
    .trim()
    .min(1, "City is required.")
    .regex(/^\d+$/, "Please select a valid City."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters."),

  email: z
    .string()
    .trim()
    .max(255, "Email cannot exceed 255 characters.")
    .refine(
      (value) =>
        value.length === 0 ||
        z.email().safeParse(value).success,
      {
        message: "Enter a valid email address.",
      },
    ),

  address: z
    .string()
    .trim()
    .max(1000, "Address cannot exceed 1000 characters."),
});

export type StoreFormValues = z.infer<
  typeof storeSchema
>;