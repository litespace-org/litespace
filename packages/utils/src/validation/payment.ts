import { isInteger } from "lodash";

/**
 * @note the cvv is considered valid event if it has 0 on the front (e.g., 007).
 */
export function isValidCvv(cvv: string): boolean {
  if (cvv.length < 3) return false;

  for (const digit of cvv.split("")) {
    if (digit === " " || digit == "" || !isInteger(Number(digit))) return false;
  }

  return true;
}
