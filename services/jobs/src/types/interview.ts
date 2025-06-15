import { IInterview, IUser } from "@litespace/types";

export type Interview = { members: IUser.Self[]; interview: IInterview.Self }[];
export type Reminder = "morning" | "immediate";

export type ValidInterivewMember = IUser.Self & {
  phone: string;
};
