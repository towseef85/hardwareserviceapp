import { z } from "zod";

export const adminChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters."),
    confirmPassword: z
      .string()
      .min(1, "Confirm the new password."),
  })
  .refine(
    (values) =>
      values.newPassword === values.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

export type AdminChangePasswordValues = z.infer<
  typeof adminChangePasswordSchema
>;
