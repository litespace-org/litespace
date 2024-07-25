import { getUser } from "@/lib/storage";
import { IUser } from "@litespace/types";
import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  async can({ resource, action, params }) {
    const user = getUser();
    if (!user) return { can: false };

    // if (
    //   user.type === IUser.Type.SuperAdmin ||
    //   user.type === IUser.Type.RegularAdmin
    // )
    //   return { can: true };

    return { can: true };
  },
};
