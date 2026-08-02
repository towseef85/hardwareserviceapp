import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

export const authAccessControl =
  createAccessControl(defaultStatements);

export const authAdminRole = authAccessControl.newRole({
  ...adminAc.statements,
});

const nonAdminStatements = {
  ...userAc.statements,
};

export const authStoreAdminRole =
  authAccessControl.newRole(nonAdminStatements);

export const authTechnicianRole =
  authAccessControl.newRole(nonAdminStatements);

export const authLegacyUserRole =
  authAccessControl.newRole(nonAdminStatements);
