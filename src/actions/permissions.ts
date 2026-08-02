"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { user as authUsers } from "@/db/auth-schema";
import {
  appUsers,
  modules,
  userPermissions,
} from "@/db/schema";
import {
  hasRole,
  requireActiveAdmin,
} from "@/lib/current-user";
import { MODULE_CODES } from "@/lib/permissions";
import { permissionFormSchema } from "@/validations/permissions";

export type PermissionActionResult = {
  success: boolean;
  message: string;
};

export async function saveUserPermissionsAction(
  input: unknown,
): Promise<PermissionActionResult> {
  const access = await requireActiveAdmin();

  if (!access.allowed) {
    return {
      success: false,
      message: access.message,
    };
  }

  const validationResult =
    permissionFormSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message:
        "The submitted permissions are invalid. Refresh the page and try again.",
    };
  }

  const { appUserId, permissions } =
    validationResult.data;

  const targetUsers = await db
    .select({
      id: appUsers.id,
      role: authUsers.role,
    })
    .from(appUsers)
    .leftJoin(
      authUsers,
      eq(appUsers.authUserId, authUsers.id),
    )
    .where(eq(appUsers.id, appUserId))
    .limit(1);

  const targetUser = targetUsers[0];

  if (!targetUser) {
    return {
      success: false,
      message: "The selected User could not be found.",
    };
  }

  if (hasRole(targetUser.role, "admin")) {
    return {
      success: false,
      message:
        "Administrator access is protected and does not use permission rows.",
    };
  }

  const moduleRecords = await db
    .select({
      id: modules.id,
      code: modules.code,
    })
    .from(modules)
    .where(inArray(modules.code, [...MODULE_CODES]));

  if (moduleRecords.length !== MODULE_CODES.length) {
    return {
      success: false,
      message:
        "Permission modules are not configured correctly. Run the database seed and try again.",
    };
  }

  const moduleIdByCode = new Map(
    moduleRecords.map((moduleRecord) => [
      moduleRecord.code,
      moduleRecord.id,
    ]),
  );

  await db
    .insert(userPermissions)
    .values(
      permissions.map((permission) => ({
        appUserId,
        moduleId: moduleIdByCode.get(
          permission.moduleCode,
        )!,
        canCreate: permission.canCreate,
        canView: permission.canView,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
      })),
    )
    .onConflictDoUpdate({
      target: [
        userPermissions.appUserId,
        userPermissions.moduleId,
      ],
      set: {
        canCreate: sql`excluded.can_create`,
        canView: sql`excluded.can_view`,
        canUpdate: sql`excluded.can_update`,
        canDelete: sql`excluded.can_delete`,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/users");
  revalidatePath(`/users/${appUserId}/permissions`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Permissions saved successfully.",
  };
}
