import { ISession } from ".";

export type Type = "lesson" | "interview";
export type Id = `${Type}:${string}`;

export type FindSessionMembersApiParams = {
  sessionId: Id;
};

export type FindSessionMembersApiResponse = number[];

export type GetSessionTokenApiResponse = {
  token: string;
};

export type GetSessionTokenApiQuery = {
  sessionId: ISession.Id;
};
