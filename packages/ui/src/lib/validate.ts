import { LocalId } from "@/locales";
import { FieldError } from "@litespace/types";
import {
  isValidPhone as isValidPhoneBase,
  isValidCvv as isValidCvvBase,
  isValidUserName as isValidUserNameBase,
  isValidEmail as isValidEmailBase,
  isValidPassword as isValidPasswordBase,
  isValidUserBirthYear as isValidUserBirthYearBase,
  isValidTutorAbout as isValidTutorAboutBase,
  isValidTutorBio as isValidTutorBioBase,
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

export function isValidUserName(name: string): LocalId | null {
  const valid = isValidUserNameBase(name);
  if (valid === true) return null;
  if (valid === FieldError.InvalidUserName) return "error.name.invalid";
  if (valid === FieldError.ShortUserName) return "error.name.length.short";
  return "error.name.length.long";
}

export function isValidEmail(email: string): LocalId | null {
  const valid = isValidEmailBase(email);
  if (valid === true) return null;
  return "error.email.invalid";
}

export function isValidPassword(password: string): LocalId | null {
  const valid = isValidPasswordBase(password);
  if (valid === true) return null;
  if (valid === FieldError.ShortPassword) return "error.password.short";
  if (valid === FieldError.LongPassword) return "error.password.long";
  return "error.password.invalid";
}

export function isValidUserBirthYear(year: number): LocalId | null {
  const valid = isValidUserBirthYearBase(year);
  if (valid === true) return null;
  return "error.birth-year-out-of-range";
}

export function isValidTutorAbout(about: string): LocalId | null {
  const valid = isValidTutorAboutBase(about);
  if (valid === true) return null;
  if (valid === FieldError.ShortTutorAbout) return "error.text.short";
  return "error.text.long";
}

export function isValidTutorBio(about: string): LocalId | null {
  const valid = isValidTutorBioBase(about);
  if (valid === true) return null;
  if (valid === FieldError.EmptyBio) return "error.bio.empty";
  if (valid === FieldError.ShortBio) return "error.text.short";
  if (valid === FieldError.LongBio) return "error.text.long";
  return "error.bio.invalid";
}
