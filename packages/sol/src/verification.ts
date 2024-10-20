import { FieldError } from "@litespace/types";
import { sanitizeMessage } from "./chat";

export function isValidEmail(email: string): FieldError.InvalidEmail | true {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!emailRegex.test(email)) return FieldError.InvalidEmail;
  return true;
}

export function isValidPassword(
  password: string
):
  | FieldError.PasswordTooShort
  | FieldError.PasswordMissingLetters
  | FieldError.PasswordMissingNumbers
  | true {
  const numbersOnly = /\d/;
  const lettersOnly = /[a-zA-Z]/;

  if (!numbersOnly.test(password)) return FieldError.PasswordMissingNumbers;
  if (!lettersOnly.test(password)) return FieldError.PasswordMissingLetters;
  if (password.length < 8) return FieldError.PasswordTooShort;

  return true;
}

export function isValidUserName(
  userName: string
): FieldError.InvalidUserName | true {
  const userNameRegex = /^[\u0600-\u06ff\s]{2,}$/;

  if (!userNameRegex.test(userName)) return FieldError.InvalidUserName;
  return true;
}

export function isValidUserBirthYear(
  userBirthYear: number
): FieldError.TutorTooOld | FieldError.TutorTooYoung | true {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 60;
  const maxYear = currentYear - 10;

  if (userBirthYear < minYear) return FieldError.TutorTooOld;
  if (userBirthYear > maxYear) return FieldError.TutorTooYoung;
  return true;
}

export function isValidTutorBio(
  tutorBio: string
):
  | FieldError.TutorBioInvalidHTML
  | FieldError.TutorBioEmpty
  | FieldError.TutorBioTooLong
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const tutorBioText = tutorBio.replace(/<[^>]*>/g, "");

  if (!tutorBioText.length) return FieldError.TutorBioEmpty;
  if (!regexForHTML.test(tutorBio)) return FieldError.TutorBioInvalidHTML;
  if (tutorBioText.length > 60) return FieldError.TutorBioTooLong;
  return true;
}

export function isValidTutorAbout(
  tutorAbout: string
):
  | FieldError.TutorAboutInvalidHTML
  | FieldError.TutorAboutEmpty
  | FieldError.TutorAboutTooLong
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const tutorAboutText = tutorAbout.replace(/<[^>]*>/g, "");

  if (!tutorAboutText.length) return FieldError.TutorAboutEmpty;
  if (!regexForHTML.test(tutorAbout)) return FieldError.TutorAboutInvalidHTML;
  if (tutorAboutText.length > 1000) return FieldError.TutorAboutTooLong;
  return true;
}

export function isValidTutorNotice(
  tutorNotice: number
): FieldError.TutorNoticeTooLong | FieldError.TutorNoticeMinus | true {
  if (tutorNotice < 0) return FieldError.TutorNoticeMinus;
  if (tutorNotice > 24 * 60) return FieldError.TutorNoticeTooLong;
  return true;
}

export function isValidRuleTitle(
  ruleTitle: string
):
  | FieldError.RuleTitleInvlaidHTML
  | FieldError.RuleTitleTooShort
  | FieldError.RuleTitleTooLong
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const ruleTitleText = ruleTitle.replace(/<[^>]*>/g, "");

  if (!regexForHTML.test(ruleTitle)) return FieldError.RuleTitleInvlaidHTML;
  if (ruleTitleText.length > 255) return FieldError.RuleTitleTooLong;
  if (ruleTitleText.length < 5) return FieldError.RuleTitleTooShort;
  return true;
}

export function isValidRuleStart(
  ruleStart: string,
  ruleEnd: string
):
  | FieldError.RuleStartISOInvalid
  | FieldError.RuleEndISOInvalid
  | FieldError.RuleStartAfterEnd
  | FieldError.RuleStartDatePassed
  | true {
  const currentTime = new Date().getTime();
  const parsedRuleStart = Date.parse(ruleStart);
  const parsedRuleEnd = Date.parse(ruleEnd);
  const ruleStartTime = new Date(ruleStart).getTime();
  const ruleEndTime = new Date(ruleEnd).getTime();

  if (!parsedRuleStart) return FieldError.RuleStartISOInvalid;
  if (!parsedRuleEnd) return FieldError.RuleEndISOInvalid;
  if (ruleStartTime > ruleEndTime) return FieldError.RuleStartAfterEnd;
  if (currentTime > ruleStartTime) return FieldError.RuleStartDatePassed;
  return true;
}

export function isValidRuleEnd(
  ruleEnd: string,
  ruleStart: string
):
  | FieldError.RuleEndISOInvalid
  | FieldError.RuleStartISOInvalid
  | FieldError.RuleEndBeforeStart
  | FieldError.RuleEndDatePassed
  | true {
  const currentTime = new Date().getTime();
  const parsedRuleEnd = Date.parse(ruleEnd);
  const parsedRuleStart = Date.parse(ruleStart);
  const ruleEndTime = new Date(ruleEnd).getTime();
  const ruleStartTime = new Date(ruleStart).getTime();

  if (!parsedRuleEnd) return FieldError.RuleEndISOInvalid;
  if (!parsedRuleStart) return FieldError.RuleStartISOInvalid;
  if (ruleEndTime < ruleStartTime) return FieldError.RuleEndBeforeStart;
  if (ruleEndTime < currentTime) return FieldError.RuleEndDatePassed;
  return true;
}

export function isValidRuleDuration(
  duration: number
): FieldError.RuleDurationMinus | FieldError.RuleDuratoinTooLong | true {
  const ruleDurationMax = 8 * 60;

  if (duration < 0) return FieldError.RuleDurationMinus;
  if (duration > ruleDurationMax) return FieldError.RuleDuratoinTooLong;
  return true;
}

export function isValidInterviewFeedback(
  feedback: string
):
  | FieldError.InterviewFeedbackTooLong
  | FieldError.InterviewFeedbackTooShort
  | FieldError.InterviewFeedbackInvalidHTML
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const feedbackText = feedback.replace(/<[^>]*>/g, "");

  if (!regexForHTML.test(feedback))
    return FieldError.InterviewFeedbackInvalidHTML;
  if (feedbackText.length < 5) return FieldError.InterviewFeedbackTooShort;
  if (feedbackText.length > 1000) return FieldError.InterviewFeedbackTooLong;
  return true;
}
export function isValidInterviewNote(
  note: string
):
  | FieldError.InterviewNoteTooLong
  | FieldError.InterviewNoteTooShort
  | FieldError.InterviewNoteInvalidHTML
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const noteText = note.replace(/<[^>]*>/g, "");

  if (!regexForHTML.test(note)) return FieldError.InterviewNoteInvalidHTML;
  if (noteText.length < 5) return FieldError.InterviewNoteTooShort;
  if (noteText.length > 1000) return FieldError.InterviewNoteTooLong;
  return true;
}

export function isValidInterviewLevel(
  level: number
):
  | FieldError.InterviewLevelBelowRange
  | FieldError.InterviewLevelAboveRange
  | true {
  const minLevel = 1;
  const maxLevel = 5;

  if (level < minLevel) return FieldError.InterviewLevelBelowRange;
  if (level > maxLevel) return FieldError.InterviewLevelAboveRange;
  return true;
}

export function isValidRatingValue(
  ratingValue: number
): FieldError.RatingValueBelowRange | FieldError.RatingValueAboveRange | true {
  const minRatingValue = 1;
  const maxRatingValue = 5;

  if (ratingValue < minRatingValue) return FieldError.RatingValueBelowRange;
  if (ratingValue > maxRatingValue) return FieldError.RatingValueAboveRange;
  return true;
}

export function isValidRatingText(
  ratingText: string
): FieldError.RatingTextTooLong | FieldError.RatingTextTooShort | true {
  if (ratingText.length > 255) return FieldError.RatingTextTooLong;
  if (ratingText.length < 3) return FieldError.RatingTextTooShort;
  return true;
}

export function isValidPlanAlias(
  planAlias: string
): FieldError.PlanAliasTooLong | FieldError.PlanAliasTooShort | true {
  if (planAlias.length > 255) return FieldError.PlanAliasTooLong;
  if (planAlias.length < 3) return FieldError.PlanAliasTooShort;
  return true;
}
export function isValidPlanWeeklyMinutes(
  weeklyMinutes: number
):
  | FieldError.PlanWeeklyMinutesAboveWeek
  | FieldError.PlanWeeklyMinutesAbsent
  | true {
  if (weeklyMinutes > 60 * 24 * 7) return FieldError.PlanWeeklyMinutesAboveWeek;
  if (weeklyMinutes <= 0) return FieldError.PlanWeeklyMinutesAbsent;
  return true;
}
export function isValidPlanPrice(
  price: number,
  discount: number
):
  | FieldError.PlanPriceZeroOrNegative
  | FieldError.PlanPriceInfinte
  | FieldError.PlanTotalDiscount
  | FieldError.PlanPriceNotInteger
  | true {
  const priceAfterDiscount = price - (price * discount) / 100;

  if (price <= 0) return FieldError.PlanPriceZeroOrNegative;
  if (!Number.isFinite(price)) return FieldError.PlanPriceInfinte;
  if (priceAfterDiscount <= 0) return FieldError.PlanTotalDiscount;
  if (!Number.isInteger(price)) return FieldError.PlanPriceNotInteger;
  return true;
}
export function isValidPlanDiscount(
  discount: number
):
  | FieldError.PlanDiscountZeroOrNegative
  | FieldError.PlanDiscountAbove100Percent
  | true {
  if (discount <= 0) return FieldError.PlanDiscountZeroOrNegative;
  if (discount > 100) return FieldError.PlanDiscountAbove100Percent;
  return true;
}

export function isValidCouponCode(
  couponCode: string
): FieldError.CouponCodeInvalid | true {
  const couponRegex = /[a-zA-Z0-9!@#$%^&*()_+=-}{?.,]/;
  if (!couponRegex.test(couponCode)) return FieldError.CouponCodeInvalid;
  return true;
}
export function isValidCouponDiscount(
  couponDiscount: number
):
  | FieldError.CouponDiscountZeroOrNegative
  | FieldError.CouponDiscountAbove100Percent
  | true {
  if (couponDiscount <= 0) return FieldError.CouponDiscountZeroOrNegative;
  if (couponDiscount > 100) return FieldError.CouponDiscountAbove100Percent;
  return true;
}
export function isValidCouponExpireDate(
  expireDate: string
):
  | FieldError.CouponExpireDateBeforeToday
  | FieldError.CouponExpireDateInvalid
  | true {
  const currentTime = new Date().getTime();
  const expireTime = new Date(expireDate).getTime();

  if (!Date.parse(expireDate)) return FieldError.CouponExpireDateInvalid;
  if (currentTime > expireTime) return FieldError.CouponExpireDateBeforeToday;
  return true;
}

export function isValidMessageText(
  message: string
):
  | FieldError.MessageTextInvalidHTML
  | FieldError.MessageTextTooLong
  | FieldError.MessageTextTooShort
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  // const sanitizedMessage = sanitizeMessage(message);
  const sanitizedMessage = message.replace(/<[^>]*>/g, "");

  if (!regexForHTML.test(message)) return FieldError.MessageTextInvalidHTML;
  if (sanitizedMessage.length > 1000) return FieldError.MessageTextTooLong;
  if (sanitizedMessage.length < 1) return FieldError.MessageTextTooShort;
  return true;
}

export function isValidWithdrawMinAmount(
  minAmount: number,
  maxAmount: number
):
  | FieldError.WithdrawMinAmountAboveMaxAmount
  | FieldError.WithdrawMaxAmountZeroOrNegative
  | FieldError.WithdrawMinAmountZeroOrNegative
  | true {
  if (minAmount <= 0) return FieldError.WithdrawMinAmountZeroOrNegative;
  if (maxAmount <= 0) return FieldError.WithdrawMaxAmountZeroOrNegative;
  if (minAmount > maxAmount) return FieldError.WithdrawMinAmountAboveMaxAmount;
  return true;
}
export function isValidWithdrawMaxAmount(
  maxAmount: number,
  minAmount: number
):
  | FieldError.WithdrawMinAmountAboveMaxAmount
  | FieldError.WithdrawMaxAmountZeroOrNegative
  | FieldError.WithdrawMinAmountZeroOrNegative
  | true {
  if (maxAmount <= 0) return FieldError.WithdrawMaxAmountZeroOrNegative;
  if (minAmount <= 0) return FieldError.WithdrawMinAmountZeroOrNegative;
  if (minAmount > maxAmount) return FieldError.WithdrawMinAmountAboveMaxAmount;
  return true;
}
export function isValidInvoiceReceiver() {}
export function isValidInvoiceAmount(
  invoiceAmount: number,
  minAmount: number,
  maxAmount: number
):
  | FieldError.InvoiceAmountZeroOrNegative
  | FieldError.InvoiceLessMinAmount
  | FieldError.InvoiceMoreMaxAmount
  | true {
  if (invoiceAmount <= 0) return FieldError.InvoiceAmountZeroOrNegative;
  if (invoiceAmount < minAmount) return FieldError.InvoiceLessMinAmount;
  if (invoiceAmount > maxAmount) return FieldError.InvoiceMoreMaxAmount;
  return true;
}
export function isValidInvoiceNote(
  invoiceNote: string
):
  | FieldError.InvoiceNoteEmpty
  | FieldError.InvoiceNoteInvalidHTML
  | FieldError.InvoiceNoteTooLong
  | true {
  const regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
  const noteText = invoiceNote.replace(/<[^>]*>/g, "");

  if (noteText.length <= 0) return FieldError.InvoiceNoteEmpty;
  if (!regexForHTML.test(invoiceNote)) return FieldError.InvoiceNoteInvalidHTML;
  if (noteText.length > 1000) return FieldError.InvoiceNoteTooLong;
  return true;
}
