import { ICall } from "@litespace/types";
import { isEmpty } from "lodash";

// todo: impl: each tutor can have interview each 3 months.
export function canBeInterviewed(calls: ICall.Self[]): boolean {
  if (isEmpty(calls)) return true;
  return false;
}
