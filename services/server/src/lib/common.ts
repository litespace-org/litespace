import { IUser } from "@litespace/types";

export function isAdmin(
  type?: IUser.Role
): type is typeof IUser.Role.SuperAdmin | typeof IUser.Role.RegularAdmin {
  return type === IUser.Role.SuperAdmin || type === IUser.Role.RegularAdmin;
}
