import { IUser } from "@litespace/types";

export function isAdmin(type: IUser.Role) {
  return type === IUser.Role.SuperAdmin || type === IUser.Role.RegularAdmin;
}
