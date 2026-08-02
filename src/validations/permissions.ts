import { z } from "zod";

import { MODULE_CODES } from "@/lib/permissions";

const modulePermissionSchema = z.object({
  moduleCode: z.enum(MODULE_CODES),
  canCreate: z.boolean(),
  canView: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

export const permissionFormSchema = z
  .object({
    appUserId: z.number().int().positive(),
    permissions: z
      .array(modulePermissionSchema)
      .length(MODULE_CODES.length),
  })
  .superRefine((value, context) => {
    const submittedCodes = new Set(
      value.permissions.map(
        (permission) => permission.moduleCode,
      ),
    );

    if (
      submittedCodes.size !== MODULE_CODES.length ||
      MODULE_CODES.some(
        (moduleCode) => !submittedCodes.has(moduleCode),
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["permissions"],
        message:
          "Submit one permission row for every module.",
      });
    }
  });

export type PermissionFormValues = z.infer<
  typeof permissionFormSchema
>;
