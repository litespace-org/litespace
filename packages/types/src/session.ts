export type Type = "lesson" | "interview";
export type Id = `${Type}:${string}`;

export type FindSessionMembersApiResponse = number[];
