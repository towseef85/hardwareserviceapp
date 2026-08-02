export const MODULE_CODES = [
  "cities",
  "stores",
  "users",
  "customers",
  "service-types",
  "services",
] as const;

export type ModuleCode =
  (typeof MODULE_CODES)[number];

export const PERMISSION_ACTIONS = [
  "create",
  "view",
  "update",
  "delete",
] as const;

export type PermissionAction =
  (typeof PERMISSION_ACTIONS)[number];

export type UserModulePermission = {
  moduleCode: ModuleCode;
  canCreate: boolean;
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export const ROLE_CODES = [
  "admin",
  "store-admin",
  "technician",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];
