import { LocalId } from "@/locales";
import {
  isValidPhone as isValidPhoneBase,
  isValidCvv as isValidCvvBase,
} from "@litespace/utils/validation";

export function validateText({
  regex,
  value,
  length,
  errors,
}: {
  regex: RegExp;
  value: string;
  length: { min: number; max: number };
  errors: { match: string; min: string; max: string };
}): string | boolean {
  const match = regex.test(value);
  if (!match) return errors.match;
  if (value.length < length.min) return errors.min;
  if (value.length > length.max) return errors.max;
  return true;
}

export function isValidPhone(phone: string): LocalId | null {
  const valid = isValidPhoneBase(phone);
  if (valid === true) return null;
  return "error.phone-number.invlaid";
}

export function isValidCvv(cvv: string): LocalId | null {
  const valid = isValidCvvBase(cvv);
  return !valid ? "error.invlaid-cvv" : null;
}
