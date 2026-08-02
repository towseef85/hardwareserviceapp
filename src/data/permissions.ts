import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { user as authUsers } from "@/db/auth-schema";
import {
  appUsers,
  modules,
  userPermissions,
} from "@/db/schema";
import {
  MODULE_CODES,
  type ModuleCode,
  type UserModulePermission,
} from "@/lib/permissions";

export async function getModules() {
  return db
    .select({
      id: modules.id,
      code: modules.code,
      name: modules.name,
      description: modules.description,
    })
    .from(modules)
    .orderBy(asc(modules.id));
}

export async function getPermissionTargetUser(
  appUserId: number,
) {
  const records = await db
    .select({
      id: appUsers.id,
      fullName: appUsers.fullName,
      username: appUsers.username,
      email: appUsers.email,
      role: authUsers.role,
    })
    .from(appUsers)
    .leftJoin(
      authUsers,
      eq(appUsers.authUserId, authUsers.id),
    )
    .where(eq(appUsers.id, appUserId))
    .limit(1);

  return records[0] ?? null;
}

export async function getUserPermissions(
  appUserId: number,
): Promise<UserModulePermission[]> {
  const records = await db
    .select({
      moduleCode: modules.code,
      canCreate: userPermissions.canCreate,
      canView: userPermissions.canView,
      canUpdate: userPermissions.canUpdate,
      canDelete: userPermissions.canDelete,
    })
    .from(userPermissions)
    .innerJoin(
      modules,
      eq(userPermissions.moduleId, modules.id),
    )
    .where(eq(userPermissions.appUserId, appUserId));

  return records
    .filter(
      (record): record is typeof record & {
        moduleCode: ModuleCode;
      } =>
        MODULE_CODES.includes(
          record.moduleCode as ModuleCode,
        ),
    )
    .map((record) => ({
      ...record,
      moduleCode: record.moduleCode,
    }));
}
