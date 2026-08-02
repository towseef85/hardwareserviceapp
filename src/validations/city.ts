import { z } from "zod";

export const citySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "City code is required.")
    .max(20, "City code cannot exceed 20 characters.")
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
    .max(150, "Arabic name cannot exceed 150 characters.")
    .optional(),
});

export type CityFormValues = z.infer<typeof citySchema>;