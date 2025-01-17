import { ISession } from "@litespace/types";
import { v4 as uuidv4 } from "uuid";

export function asSessionId(id: string) {
  const parts = id.split(":");
  if (
    parts.length !== 3 ||
    !["lesson", "interview"].includes(parts[1]) ||
    isNaN(Number(parts[0]))
  )
    throw Error("Invalid session id.");
  return id as ISession.Id;
}

export function isSessionId(id: string): id is ISession.Id {
  const parts = id.split(":");
  return (
    parts.length === 3 &&
    ["lesson", "interview"].includes(parts[1]) &&
    !isNaN(Number(parts[0]))
  );
}

export function genSessionRowId(type: ISession.Type): ISession.RowId {
  return `${type}:${uuidv4()}`;
}

export function getSessionType(
  id: ISession.RowId | ISession.Id
): ISession.Type {
  const parts = id.split(":");
  return parts[parts.length - 2] as ISession.Type;
}
