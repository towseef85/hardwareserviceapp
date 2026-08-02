import { getUserPermissions } from "@/data/permissions";
import {
  getCurrentUserAccess,
  hasRole,
  type CurrentUserAccess,
} from "@/lib/current-user";
import {
  MODULE_CODES,
  type ModuleCode,
  type PermissionAction,
  type UserModulePermission,
} from "@/lib/permissions";

type ActiveUserAccess = Extract<
  CurrentUserAccess,
  { status: "active" }
>;

const permissionFieldByAction = {
  create: "canCreate",
  view: "canView",
  update: "canUpdate",
  delete: "canDelete",
} as const satisfies Record<
  PermissionAction,
  keyof Omit<UserModulePermission, "moduleCode">
>;

function getAdminPermissions(): UserModulePermission[] {
  return MODULE_CODES.map((moduleCode) => ({
    moduleCode,
    canCreate: true,
    canView: true,
    canUpdate: true,
    canDelete: true,
  }));
}

function getRoleDefaultPermissions(
  role: string | null,
): UserModulePermission[] {
  if (hasRole(role, "admin")) {
    return getAdminPermissions();
  }

  return MODULE_CODES.map((moduleCode) => {
    const isRepairModule = [
      "customers",
      "service-types",
      "services",
    ].includes(moduleCode);
    const isStoreAdmin = hasRole(role, "store-admin");
    const isTechnician = hasRole(role, "technician");

    return {
      moduleCode,
      canCreate: isStoreAdmin && isRepairModule,
      canView:
        (isStoreAdmin && isRepairModule) ||
        (isTechnician && moduleCode === "services"),
      canUpdate: isStoreAdmin && isRepairModule,
      canDelete: false,
    };
  });
}

async function getEffectivePermissions(
  access: ActiveUserAccess,
): Promise<UserModulePermission[]> {
  return getEffectivePermissionsForUser(
    access.profileId,
    access.role,
  );
}

export async function getEffectivePermissionsForUser(
  appUserId: number,
  role: string | null,
): Promise<UserModulePermission[]> {
  const defaults = getRoleDefaultPermissions(role);

  if (hasRole(role, "admin")) {
    return defaults;
  }

  const overrides = await getUserPermissions(
    appUserId,
  );
  const overrideByModule = new Map(
    overrides.map((permission) => [
      permission.moduleCode,
      permission,
    ]),
  );

  const merged = defaults.map(
    (permission) =>
      overrideByModule.get(permission.moduleCode) ??
      permission,
  );

  if (hasRole(role, "technician")) {
    return merged.map((permission) => ({
      ...permission,
      canCreate: false,
      canView: permission.moduleCode === "services",
      canUpdate: false,
      canDelete: false,
    }));
  }

  if (hasRole(role, "store-admin")) {
    return merged.map((permission) => ({
      ...permission,
      canDelete: [
        "customers",
        "service-types",
        "services",
      ].includes(permission.moduleCode)
        ? false
        : permission.canDelete,
    }));
  }

  return merged;
}

export async function getCurrentUserPermissions(): Promise<
  UserModulePermission[]
> {
  const access = await getCurrentUserAccess();

  if (access.status !== "active") {
    return [];
  }

  return getEffectivePermissions(access);
}

export async function hasPermission(
  moduleCode: ModuleCode,
  action: PermissionAction,
): Promise<boolean> {
  const access = await getCurrentUserAccess();

  if (access.status !== "active") {
    return false;
  }

  const permissions = await getEffectivePermissions(access);
  const permission = permissions.find(
    (item) => item.moduleCode === moduleCode,
  );

  return Boolean(
    permission?.[permissionFieldByAction[action]],
  );
}

export type PermissionAccessResult =
  | {
      allowed: true;
      user: ActiveUserAccess;
      permission: UserModulePermission;
    }
  | {
      allowed: false;
      message: string;
    };

export async function requirePermission(
  moduleCode: ModuleCode,
  action: PermissionAction,
): Promise<PermissionAccessResult> {
  const access = await getCurrentUserAccess();

  if (access.status === "unauthenticated") {
    return {
      allowed: false,
      message: "Your session has expired. Sign in again.",
    };
  }

  if (access.status === "inactive") {
    return {
      allowed: false,
      message: "Your account is inactive.",
    };
  }

  if (access.status === "profile-missing") {
    return {
      allowed: false,
      message:
        "Your login is not linked to an application profile.",
    };
  }

  const permission = (
    await getEffectivePermissions(access)
  ).find((item) => item.moduleCode === moduleCode);

  if (
    !permission ||
    !permission[permissionFieldByAction[action]]
  ) {
    return {
      allowed: false,
      message:
        "You do not have permission to perform this action.",
    };
  }

  return {
    allowed: true,
    user: access,
    permission,
  };
}
