export type Type = "lesson" | "interview";

/**
 * This type indicates how session_id is stored in the database.
 */
export type RowId = `${Type}:${string}`;

/**
 * This type imposes how session_id is manipulated and viewed in the api.
 * It's a combination of lesson/interview id with the RowId.
 */
export type Id = `${number}:${RowId}`;

export type FindSessionMembersApiResponse = number[];
