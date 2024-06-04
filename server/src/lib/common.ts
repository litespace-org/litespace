import { IUser } from "@litespace/types";

export function isAdmin(type: IUser.Type) {
  return type === IUser.Type.SuperAdmin || type === IUser.Type.RegularAdmin;
}
