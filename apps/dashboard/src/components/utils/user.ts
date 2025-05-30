import { LocalId } from "@litespace/ui/locales";
import { IUser } from "@litespace/types";

export const rolesMap: Record<IUser.Role, LocalId> = {
  [IUser.Role.SuperAdmin]: "global.role.super-admin",
  [IUser.Role.RegularAdmin]: "global.role.regular-admin",
  [IUser.Role.Studio]: "global.role.studio",
  [IUser.Role.TutorManager]: "global.role.tutor-manager",
  [IUser.Role.Tutor]: "global.role.tutor",
  [IUser.Role.Student]: "global.role.student",
};
