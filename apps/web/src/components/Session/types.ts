import { IUser } from "@litespace/types";

export type RemoteMember = {
  id: number;
  name: string | null;
  role: IUser.Role;
  image: string | null;
};
