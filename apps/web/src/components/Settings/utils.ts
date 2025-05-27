import { IUser } from "@litespace/types";

export function isPersonalInfoIncomplete(user: IUser.Self) {
  return (
    !user.name ||
    !user.email ||
    !user.phone ||
    !user.city ||
    !user.gender ||
    !user.image ||
    !user.verifiedEmail ||
    !user.verifiedPhone
  );
}
