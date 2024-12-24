import { IInterview, ILesson, IUser } from "@/index";

export type Row = ILesson.Row | IInterview.Row;

export type Self = ILesson.Self | IInterview.Self;

export type Type = "lesson" | "interview";
export type Id = `${Type}:${string}`;

export type MemberRow = {
  user_id: number;
  session_id: Id;
};

export type Member = {
  userId: number;
  sessionId: Id;
};

export type PopuldatedMemberRow = {
  session_id: Id;
  user_id: number;
  name: IUser.Row["name"];
  image: IUser.Row["image"];
  role: IUser.Role;
};

export type PopuldatedMember = {
  sessionId: Id;
  userId: number;
  name: IUser.Self["name"];
  image: IUser.Self["image"];
  role: IUser.Role;
};

export type FindSessionMembersApiResponse = number[];
export type FindUserSessionsApiResponse = Id[];
