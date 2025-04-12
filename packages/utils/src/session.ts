import { ISession } from "@litespace/types";
import { first } from "lodash";
import { v4 as uuidv4 } from "uuid";

export function asSessionId(id: string) {
  if (!id.startsWith("lesson:") && !id.startsWith("interview:"))
    throw Error("Invalid session id.");
  return id as ISession.Id;
}

export function isSessionId(id: string): id is ISession.Id {
  const [prefix, uuid] = id.split(":");
  return (prefix === "lesson" || prefix === "interview") && !!uuid;
}

export function genSessionId(type: ISession.Type): ISession.Id {
  return `${type}:${uuidv4()}`;
}

export function getSessionType(id: ISession.Id): ISession.Type {
  return first(id.split(":")) as ISession.Type;
}

export function isValidSessionType(value: unknown): value is ISession.Type {
  return value === "lesson" || value === "interview";
}
