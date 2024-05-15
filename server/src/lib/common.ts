import { User } from "@/database";

export function isAdmin(type: User.Type) {
  return type === User.Type.SuperAdmin || type === User.Type.RegularAdmin;
}
