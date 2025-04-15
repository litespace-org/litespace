import { isInteger } from "lodash";
import { CONFIRMATION_CODE_DIGIT_COUNT } from "@/constants";

export function isValidConfirmationCode(value: unknown): value is number {
  return (
    !!value &&
    isInteger(value) &&
    value.toString().length === CONFIRMATION_CODE_DIGIT_COUNT
  );
}
