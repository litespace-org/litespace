import { ISession } from "@litespace/types";
import { v4 as uuidv4 } from 'uuid';

export function asSessionId(id: string) {
  if (!id.startsWith("lesson:") && !id.startsWith("interview:"))
    throw Error("Invalid session id.")
  return id as ISession.Id;
}

export function genSessionId(type: ISession.Type): ISession.Id {
  return `${type}:${uuidv4()}`;
}
