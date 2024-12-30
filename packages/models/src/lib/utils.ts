import { ISession } from "@litespace/types";
import { randomUUID } from "crypto";

export function asSessionId(id: string) {
  if (!id.startsWith("lesson:") && !id.startsWith("interview:"))
    throw Error("Invalid session id.")
  return id as ISession.Id;
}

export function genSessionId(type: ISession.Type): ISession.Id {
  return `${type}:${randomUUID()}`;
}
