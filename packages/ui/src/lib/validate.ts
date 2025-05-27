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
  validateTutorNotice as validateTutorNoticeBase,
  isValidTutorBio as isValidTutorBioBase,
  isValidConfirmationCode as isValidConfirmationCodeBase,
  validatePlanWeeklyMinutes as validatePlanWeeklyMinutesBase,
  validatePlanPrice as validatePlanPriceBase,
  validatePlanDiscount as validatePlanDiscountBase,
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

export function validatePhone(phone: string): LocalId | null {
  const valid = isValidPhoneBase(phone);
  if (valid === true) return null;
  return "error.phone-number.invlaid";
}

export function validateCvv(cvv: string): LocalId | null {
  const valid = isValidCvvBase(cvv);
  return !valid ? "error.invlaid-cvv" : null;
}

export function validateUserName(name: string): LocalId | null {
  const valid = isValidUserNameBase(name);
  if (valid === true) return null;
  if (valid === FieldError.InvalidUserName) return "error.name.invalid";
  if (valid === FieldError.ShortUserName) return "error.name.length.short";
  return "error.name.length.long";
}

export function validateEmail(email: string): LocalId | null {
  const valid = isValidEmailBase(email);
  if (valid === true) return null;
  return "error.email.invalid";
}

export function validatePassword(password: string): LocalId | null {
  const valid = isValidPasswordBase(password);
  if (valid === true) return null;
  if (valid === FieldError.ShortPassword) return "error.password.short";
  if (valid === FieldError.LongPassword) return "error.password.long";
  return "error.password.invalid";
}

export function validateUserBirthYear(year: number): LocalId | null {
  const valid = isValidUserBirthYearBase(year);
  if (valid === true) return null;
  return "error.birth-year-out-of-range";
}

export function validateTutorAbout(about: string): LocalId | null {
  const valid = isValidTutorAboutBase(about);
  if (valid === true) return null;
  if (valid === FieldError.ShortTutorAbout) return "error.text.short";
  return "error.text.long";
}

export function validateTutorBio(about: string): LocalId | null {
  const valid = isValidTutorBioBase(about);
  if (valid === true) return null;
  if (valid === FieldError.EmptyBio) return "error.field.bio.empty";
  if (valid === FieldError.ShortBio) return "error.text.short";
  if (valid === FieldError.LongBio) return "error.text.long";
  return "error.field.bio.invalid";
}

export function validateConfirmationCode(code: number): LocalId | null {
  const valid = isValidConfirmationCodeBase(code);
  if (valid === true) return null;
  return "error.field.confirmation-code.invalid";
}

export function validatePlanWeeklyMinutes(
  weeklyMinutes: number
): LocalId | null {
  const error = validatePlanWeeklyMinutesBase(weeklyMinutes);
  if (!error) return null;
  return "error.field.invalid-weekly-minutes";
}

export function validatePlanPrice(price: number): LocalId | null {
  const error = validatePlanPriceBase(price);
  if (!error) return null;
  return "error.field.invalid-plan-price";
}

export function validatePlanDiscount(discount: number): LocalId | null {
  const error = validatePlanDiscountBase(discount);
  if (!error) return null;
  return "error.field.invalid-plan-discount";
}

export function validateNotice(notice: number): LocalId | null {
  const error = validateTutorNoticeBase(notice);
  if (!error) return null;
  if (error === FieldError.MaxNoticeExceeded)
    return "error.field.max-notice-exceeded";
  return "error.field.invalid-notice";
}
