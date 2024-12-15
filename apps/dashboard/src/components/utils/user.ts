import { LocalId } from "@litespace/luna/locales";
import { IUser } from "@litespace/types";

export const rolesMap: Record<IUser.Role, LocalId> = {
  [IUser.Role.SuperAdmin]: "global.role.super-admin",
  [IUser.Role.RegularAdmin]: "global.role.regular-admin",
  [IUser.Role.MediaProvider]: "global.role.media-provider",
  [IUser.Role.TutorManager]: "global.role.tutor-manager",
  [IUser.Role.Tutor]: "global.role.tutor",
  [IUser.Role.Student]: "global.role.student",
};
