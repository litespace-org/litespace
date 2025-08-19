import { LocalId } from "@/locales";
import { FieldError, IInvoice, IStudent } from "@litespace/types";
import { MAX_INVOICE_AMOUNT, MIN_INVOICE_AMOUNT } from "@litespace/utils";
import {
  isValidBankname,
  isValidBankNumber,
  isValidConfirmationCode as isValidConfirmationCodeBase,
  isValidCvv as isValidCvvBase,
  isValidEmail as isValidEmailBase,
  isValidEnglishLevel,
  isValidInstapayIPA,
  isValidInvoiceAmount,
  isValidInvoiceMethod,
  isValidInvoiceReceiver,
  isValidPassword as isValidPasswordBase,
  isValidPhone as isValidPhoneBase,
  isValidTutorAbout as isValidTutorAboutBase,
  isValidTutorBio as isValidTutorBioBase,
  isValidTutorName as isValidTutorNameBase,
  isValidUserBirthYear as isValidUserBirthYearBase,
  isValidUserName as isValidUserNameBase,
  validatePlanDiscount as validatePlanDiscountBase,
  validatePlanPrice as validatePlanPriceBase,
  validatePlanWeeklyMinutes as validatePlanWeeklyMinutesBase,
  validateTutorNotice as validateTutorNoticeBase,
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

export function validateTutorName(name: string): LocalId | null {
  const valid = isValidTutorNameBase(name);
  if (valid === true) return null;
  if (valid === FieldError.InvalidTutorName) return "error.tutor-name.invalid";
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
  if (valid === FieldError.LongTutorAbout) return "error.text.long";
  return "error.field.about.invalid";
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

export function validateInvoiceAmount(amount: number): LocalId | null {
  const error = isValidInvoiceAmount(
    amount,
    MIN_INVOICE_AMOUNT,
    MAX_INVOICE_AMOUNT
  );
  if (error === FieldError.InvoiceMinAmountSubceeded)
    return "error.field.invoice-min-amount-subceeded";
  if (error === FieldError.InvoiceMaxAmountExceeded)
    return "error.field.invoice-max-amount-exceeded";
  return null;
}

export function validateInvoiceMethod(
  method: IInvoice.WithdrawMethod
): LocalId | null {
  const isValid = isValidInvoiceMethod(method);
  if (isValid) return null;
  return "error.field.invalid-invoice-method";
}

export function validateInvoiceReceiver(
  receiver: string,
  type: IInvoice.WithdrawMethod
): LocalId | null {
  const error = isValidInvoiceReceiver(receiver, type);
  if (!error) return null;
  if (error === FieldError.InvalidPhone) return "error.phone-number.invlaid";
  if (error === FieldError.InvalidInstapayIPA)
    return "error.field.invalid-instapay-ipa";
  if (error === FieldError.EmptyBankName) return "error.field.empty-bank-name";
  if (error === FieldError.InvalidBankName)
    return "error.field.invalid-bank-name";
  if (error === FieldError.InvalidBankAccountNumber)
    return "error.field.invalid-bank-number";
  return "error.field.invalid-withdraw-method";
}

export function validateInstapayIPA(ipa: string): LocalId | null {
  const error = isValidInstapayIPA(ipa);
  if (error === FieldError.InvalidInstapayIPA)
    return "error.field.invalid-instapay-ipa";
  return null;
}

export function validateBankname(name: IInvoice.Bank): LocalId | null {
  const error = isValidBankname(name);
  if (error === FieldError.EmptyBankName) return "error.field.empty-bank-name";
  if (error === FieldError.InvalidBankName)
    return "error.field.invalid-bank-name";
  return null;
}

export function validateBankNumber(number: string): LocalId | null {
  const error = isValidBankNumber(number);
  if (error === FieldError.InvalidBankAccountNumber)
    return "error.field.invalid-bank-number";
  return null;
}

export function validateEnglishLevel(
  level: IStudent.EnglishLevel
): LocalId | null {
  const error = isValidEnglishLevel(level);
  if (error === FieldError.InvalidEnglishLevel)
    return "error.field.invalid-english-level";
  return null;
}
