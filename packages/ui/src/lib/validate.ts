import { LocalId } from "@/locales";
import { FieldError } from "@litespace/types";
import {
  isValidPhone as isValidPhoneBase,
  isValidCvv as isValidCvvBase,
  isValidUserName as isValidUserNameBase,
  isValidEmail as isValidEmailBase,
  isValidPassword as isValidPasswordBase,
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

export function isValidPhone(phone: string | null | undefined): LocalId | null {
  const valid = isValidPhoneBase(phone);
  if (valid === true) return null;
  return "error.phone-number.invlaid";
}

export function isValidCvv(cvv: string): LocalId | null {
  const valid = isValidCvvBase(cvv);
  return !valid ? "error.invlaid-cvv" : null;
}

export function isValidUserName(name: string | null): LocalId | null {
  const valid = isValidUserNameBase(name);

  if (valid === true) return null;
  if (valid === FieldError.InvalidUserName)
    return "error.field.invalid-user-name";
  if (valid === FieldError.ShortUserName) return "error.field.short-user-name";
  return "error.field.long-user-name";
}

export function isValidEmail(email: string): LocalId | null {
  const valid = isValidEmailBase(email);

  if (valid === true) return null;
  return "error.field.invalid-email";
}

export function isValidPassword(password: string): LocalId | null {
  const valid = isValidPasswordBase(password);

  if (valid === true) return null;
  if (valid === FieldError.ShortPassword) return "error.field.short-password";
  if (valid === FieldError.LongPassword) return "error.field.long-password";
  return "error.field.invalid-password";
}
