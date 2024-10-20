import { Bank, FieldError, IInvoice } from "@litespace/types";
import {
  COUPON_REGEX,
  DISCOUNT_MAX_VALUE,
  DISCOUNT_MIN_VALUE,
  EMAIL_REGEX,
  INSTAPAY_REGEX,
  INTERVIEW_MAX_LEVEL,
  INTERVIEW_MIN_LEVEL,
  LETTERS_ONLY_REGEX,
  MINUTES_IN_WEEK,
  NUMBERS_ONLY_REGEX,
  PHONE_NUMBER_REGEX,
  RATING_MAX_VALUE,
  RATING_MIN_VALUE,
  REGEXFORHTML,
  RULE_DURATION_MAX,
  USER_NAME_REGEX,
} from "@/constants";
import { getTextFromHTMLString } from "./utils";
import { sanitizeMessage } from "./chat";

export function isValidEmail(email: string): FieldError.InvalidEmail | true {
  if (!EMAIL_REGEX.test(email)) return FieldError.InvalidEmail;
  return true;
}

export function isValidPassword(
  password: string
):
  | FieldError.PasswordTooShort
  | FieldError.PasswordMissingLetters
  | FieldError.PasswordMissingNumbers
  | true {
  if (!NUMBERS_ONLY_REGEX.test(password))
    return FieldError.PasswordMissingNumbers;
  if (!LETTERS_ONLY_REGEX.test(password))
    return FieldError.PasswordMissingLetters;
  if (password.length < 8) return FieldError.PasswordTooShort;
  return true;
}

export function isValidUserName(
  userName: string
): FieldError.InvalidUserName | true {
  if (!USER_NAME_REGEX.test(userName)) return FieldError.InvalidUserName;
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
  const tutorBioText = getTextFromHTMLString(tutorBio);
  console.log("text", tutorBioText);
  if (!tutorBioText.length) return FieldError.TutorBioEmpty;
  if (!REGEXFORHTML.test(tutorBio)) return FieldError.TutorBioInvalidHTML;
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
  const tutorAboutText = getTextFromHTMLString(tutorAbout);

  if (!tutorAboutText.length) return FieldError.TutorAboutEmpty;
  if (!REGEXFORHTML.test(tutorAbout)) return FieldError.TutorAboutInvalidHTML;
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
  const ruleTitleText = getTextFromHTMLString(ruleTitle);

  if (!REGEXFORHTML.test(ruleTitle)) return FieldError.RuleTitleInvlaidHTML;
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
  if (duration < 0) return FieldError.RuleDurationMinus;
  if (duration > RULE_DURATION_MAX) return FieldError.RuleDuratoinTooLong;
  return true;
}

export function isValidInterviewFeedback(
  feedback: string
):
  | FieldError.InterviewFeedbackTooLong
  | FieldError.InterviewFeedbackTooShort
  | FieldError.InterviewFeedbackInvalidHTML
  | true {
  const feedbackText = getTextFromHTMLString(feedback);

  if (!REGEXFORHTML.test(feedback))
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
  const noteText = note.replace(/<[^>]*>/g, "");

  if (!REGEXFORHTML.test(note)) return FieldError.InterviewNoteInvalidHTML;
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
  if (level < INTERVIEW_MIN_LEVEL) return FieldError.InterviewLevelBelowRange;
  if (level > INTERVIEW_MAX_LEVEL) return FieldError.InterviewLevelAboveRange;
  return true;
}

export function isValidRatingValue(
  ratingValue: number
): FieldError.RatingValueBelowRange | FieldError.RatingValueAboveRange | true {
  if (ratingValue < RATING_MIN_VALUE) return FieldError.RatingValueBelowRange;
  if (ratingValue > RATING_MAX_VALUE) return FieldError.RatingValueAboveRange;
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
  if (weeklyMinutes > MINUTES_IN_WEEK)
    return FieldError.PlanWeeklyMinutesAboveWeek;
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
  if (!COUPON_REGEX.test(couponCode)) return FieldError.CouponCodeInvalid;
  return true;
}
export function isValidCouponDiscount(
  couponDiscount: number
):
  | FieldError.CouponDiscountZeroOrNegative
  | FieldError.CouponDiscountAbove100Percent
  | true {
  if (couponDiscount <= DISCOUNT_MIN_VALUE)
    return FieldError.CouponDiscountZeroOrNegative;
  if (couponDiscount > DISCOUNT_MAX_VALUE)
    return FieldError.CouponDiscountAbove100Percent;
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
  const text = getTextFromHTMLString(message);

  if (!REGEXFORHTML.test(message)) return FieldError.MessageTextInvalidHTML;
  if (text.length > 1000) return FieldError.MessageTextTooLong;
  if (text.length < 1) return FieldError.MessageTextTooShort;
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
export function isValidInvoiceReceiver(
  receiver: string,
  type: IInvoice.RecivingMethod,
  bankName?: Bank
) {
  if (type === IInvoice.RecivingMethod.Wallet) {
    if (!PHONE_NUMBER_REGEX.test(receiver))
      return FieldError.PhoneNumberInValid;
    return true;
  }
  if (type === IInvoice.RecivingMethod.Instapay) {
    if (!INSTAPAY_REGEX.test(receiver)) return FieldError.InstapayIPAInvalid;
    return true;
  }
  // if (type === IInvoice.RecivingMethod.Bank) {
  //   if (bankName === Bank.Alex) {

  //   }
  // }
}
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
  const noteText = getTextFromHTMLString(invoiceNote);
  if (noteText.length <= 0) return FieldError.InvoiceNoteEmpty;
  if (!REGEXFORHTML.test(invoiceNote)) return FieldError.InvoiceNoteInvalidHTML;
  if (noteText.length > 1000) return FieldError.InvoiceNoteTooLong;
  return true;
}
