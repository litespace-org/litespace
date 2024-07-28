import { getUser } from "@/lib/storage";
import { IUser } from "@litespace/types";
import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  async can({ resource, action, params }) {
    const user = getUser();
    if (!user) return { can: false };
    return { can: true };
  },
};
