import { values } from "lodash";

export function isValuedObject<T extends object>(object: T): boolean {
  return values(object).some((value) => !!value);
}
