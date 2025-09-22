import { IUser } from "@/index";

export type Type = "lesson" | "interview" | "demo";
export type Id = `${Type}:${string}`;

export type FindSessionMembersApiParams = {
  sessionId: Id;
};

export type FindSessionMembersApiResponse = Array<
  Pick<IUser.Self, "id" | "name" | "role" | "gender">
>;

export type GetSessionTokenApiResponse = {
  token: string;
};

export type GetSessionTokenApiQuery = {
  sessionId: Id;
};
