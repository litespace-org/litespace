import { faker } from "@faker-js/faker/locale/ar";
import { ISession } from "@litespace/types";
import { randomUUID } from "crypto";

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

export function genSessionId(type: ISession.Type, id?: number): ISession.Id {
  return `${id || faker.number.int()}:${type}:${randomUUID()}`;
}
