import { z } from "zod";

const userFields = {
    role: z.enum(["store-admin", "technician"], {
      message: "Select a valid role.",
    }),

    cityId: z
      .string()
      .trim()
      .min(1, "City is required.")
      .regex(/^\d+$/, "Select a valid City."),

    storeId: z
      .string()
      .trim()
      .min(1, "Store is required.")
      .regex(/^\d+$/, "Select a valid Store."),

    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .max(150, "Full name cannot exceed 150 characters."),

    contact: z
      .string()
      .trim()
      .max(30, "Contact cannot exceed 30 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .max(255, "Email cannot exceed 255 characters.")
      .email("Enter a valid email address."),

    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters.")
      .regex(
        /^[A-Za-z0-9_.]+$/,
        "Username can contain only letters, numbers, underscores, and dots.",
      ),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters."),

    confirmPassword: z
      .string()
      .min(1, "Confirm your password."),

    isActive: z.boolean(),
};

export const userSchema = z
  .object(userFields)
  .refine(
    (values) => values.password === values.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    },
  );

export type UserFormValues = z.infer<
  typeof userSchema
>;

export const userEditSchema = z.object({
  role: z.enum(["admin", "store-admin", "technician"], {
    message: "Select a valid role.",
  }),
  cityId: userFields.cityId,
  storeId: userFields.storeId,
  fullName: userFields.fullName,
  contact: userFields.contact,
  email: userFields.email,
  username: userFields.username,
  isActive: userFields.isActive,
});

export type UserEditFormValues = z.infer<
  typeof userEditSchema
>;
