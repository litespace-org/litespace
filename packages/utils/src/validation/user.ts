import {
  EMAIL_REGEX,
  MAX_PASSWORD_LENGTH,
  MAX_USER_AGE,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USER_AGE,
  MIN_USER_NAME_LENGTH,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
  USER_NAME_REGEX,
} from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidUserName(
  name: unknown
):
  | FieldError.InvalidUserName
  | FieldError.ShortUserName
  | FieldError.LongUserName
  | true {
  if (typeof name !== "string" || !USER_NAME_REGEX.test(name))
    return FieldError.InvalidUserName;
  if (name.length < MIN_USER_NAME_LENGTH) return FieldError.ShortUserName;
  if (name.length > MAX_USER_NAME_LENGTH) return FieldError.LongUserName;
  return true;
}

export function isValidEmail(email: unknown): FieldError.InvalidEmail | true {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email))
    return FieldError.InvalidEmail;
  return true;
}

export function isValidPhone(phone: unknown) {
  if (typeof phone !== "string" || !PHONE_NUMBER_REGEX.test(phone))
    return FieldError.InvalidPhone;
  return true;
}

export function isValidPassword(
  password: unknown
):
  | FieldError.ShortPassword
  | FieldError.LongPassword
  | FieldError.InvalidPassword
  | true {
  if (typeof password !== "string") return FieldError.InvalidPassword;
  if (password.length < MIN_PASSWORD_LENGTH) return FieldError.ShortPassword;
  if (password.length > MAX_PASSWORD_LENGTH) return FieldError.LongPassword;
  if (!PASSWORD_REGEX.test(password)) return FieldError.InvalidPassword;

  return true;
}

export function isValidUserBirthYear(
  userBirthYear: number
): FieldError.OldUser | FieldError.YoungUser | true {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - MAX_USER_AGE;
  const maxYear = currentYear - MIN_USER_AGE;

  if (userBirthYear < minYear) return FieldError.OldUser;
  if (userBirthYear > maxYear) return FieldError.YoungUser;
  return true;
}
