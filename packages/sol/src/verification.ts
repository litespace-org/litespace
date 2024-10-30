import {
  COUPON_REGEX,
  EMAIL_REGEX,
  HTML_REGEX,
  HTML_TAGS_REGEX,
  INSTAPAY_REGEX,
  LETTERS_ONLY_REGEX,
  MAX_DISCOUNT_VALUE,
  MAX_FEEDBACK_TEXT_LENGTH,
  MAX_INTERVIEW_LEVEL,
  MAX_MESSAGE_TEXT_LENGTH,
  MAX_NOTE_TEXT_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PLAN_ALIAS_LENGTH,
  MAX_PLAN_DISCOUNT,
  MAX_PLAN_WEEKLY_MINUTES,
  MAX_RATING_TEXT_LENGTH,
  MAX_RATING_VALUE,
  MAX_RULE_DURATION_MINUTES,
  MAX_RULE_TITLE_LENGTH,
  MAX_TUTOR_ABOUT_TEXT_LENGTH,
  MAX_TUTOR_BIO_TEXT_LENGTH,
  MAX_TUTOR_NOTICE_DURATION,
  MAX_USER_AGE,
  MIN_DISCOUNT_VALUE,
  MIN_FEEDBACK_TEXT_LENGTH,
  MIN_INTERVIEW_LEVEL,
  MIN_MESSAGE_TEXT_LENGTH,
  MIN_NOTE_TEXT_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_PLAN_ALIAS_LENGTH,
  MIN_PLAN_DISCOUNT,
  MIN_PLAN_WEEKLY_MINUTES,
  MIN_RATING_TEXT_LENGTH,
  MIN_RATING_VALUE,
  MIN_RULE_DURATION_MINUTES,
  MIN_RULE_TITLE_LENGTH,
  MIN_TUTOR_NOTICE_DURATION,
  MIN_USER_AGE,
  NUMBERS_ONLY_REGEX,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
  USER_NAME_REGEX,
} from "@/constants";
import { Bank, FieldError, WithdrawMethod } from "@litespace/types";
import { getSafeInnerHtmlText } from "./utils";

export function isValidEmail(email: string): FieldError.InvalidEmail | true {
  if (!EMAIL_REGEX.test(email)) return FieldError.InvalidEmail;
  return true;
}

export function isValidPassword(
  password: string
):
  | FieldError.PasswordTooShort
  | FieldError.PasswordTooLong
  | FieldError.PasswordMissingLetters
  | FieldError.PasswordMissingNumbers
  | true {
  if (!NUMBERS_ONLY_REGEX.test(password))
    return FieldError.PasswordMissingNumbers;
  if (!LETTERS_ONLY_REGEX.test(password))
    return FieldError.PasswordMissingLetters;
  if (password.length > MAX_PASSWORD_LENGTH) return FieldError.PasswordTooShort;
  if (password.length < MIN_PASSWORD_LENGTH) return FieldError.PasswordTooShort;
  if (PASSWORD_REGEX.test(password)) return true;
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
): FieldError.UserTooOld | FieldError.UserTooYoung | true {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - MAX_USER_AGE;
  const maxYear = currentYear - MIN_USER_AGE;

  if (userBirthYear < minYear) return FieldError.UserTooOld;
  if (userBirthYear > maxYear) return FieldError.UserTooYoung;
  return true;
}

export function isValidTutorBio(
  bio: string
): FieldError.EmptyBio | FieldError.TooLongBio | true {
  if (!bio.length) return FieldError.EmptyBio;
  if (bio.length > MAX_TUTOR_BIO_TEXT_LENGTH) return FieldError.TooLongBio;

  return true;
}

export function isValidTutorAbout(
  about: string
):
  | FieldError.InvalidTutorAbout
  | FieldError.EmptyTutorAbout
  | FieldError.TooLongTutorAbout
  | true {
  const tutorAboutText = getSafeInnerHtmlText(about);

  if (!tutorAboutText.length) return FieldError.EmptyTutorAbout;
  if (!HTML_REGEX.test(about)) return FieldError.InvalidTutorAbout;
  if (tutorAboutText.length > MAX_TUTOR_ABOUT_TEXT_LENGTH)
    return FieldError.TooLongTutorAbout;
  return true;
}

export function isValidTutorNotice(
  tutorNotice: number
): FieldError.MaxNoticeExceeded | FieldError.InvalidNotice | true {
  if (tutorNotice <= MIN_TUTOR_NOTICE_DURATION) return FieldError.InvalidNotice;
  if (tutorNotice > MAX_TUTOR_NOTICE_DURATION)
    return FieldError.MaxNoticeExceeded;
  return true;
}

export function isValidRuleTitle(
  title: string
): FieldError.TooShortRuleTitle | FieldError.TooLongRuleTitle | true {
  if (title.length > MAX_RULE_TITLE_LENGTH) return FieldError.TooLongRuleTitle;
  if (title.length < MIN_RULE_TITLE_LENGTH) return FieldError.TooShortRuleTitle;
  return true;
}

export function isValidRuleStart(
  ruleStart: string,
  ruleEnd: string
):
  | FieldError.ISOInvalidRuleStart
  | FieldError.ISOInvalidRuleEnd
  | FieldError.RuleStartAfterEnd
  | FieldError.RuleStartDatePassed
  | true {
  if (!Date.parse(ruleStart)) return FieldError.ISOInvalidRuleStart;
  if (!Date.parse(ruleEnd)) return FieldError.ISOInvalidRuleEnd;
  if (new Date(ruleStart) > new Date(ruleEnd))
    return FieldError.RuleStartAfterEnd;
  if (new Date() > new Date(ruleStart)) return FieldError.RuleStartDatePassed;
  return true;
}

export function isValidRuleEnd(
  ruleEnd: string,
  ruleStart: string
):
  | FieldError.ISOInvalidRuleEnd
  | FieldError.ISOInvalidRuleStart
  | FieldError.RuleEndBeforeStart
  | FieldError.RuleEndDatePassed
  | true {
  const currentTime = new Date().getTime();
  const parsedRuleEnd = Date.parse(ruleEnd);
  const parsedRuleStart = Date.parse(ruleStart);
  const ruleEndTime = new Date(ruleEnd).getTime();
  const ruleStartTime = new Date(ruleStart).getTime();

  if (!parsedRuleEnd) return FieldError.ISOInvalidRuleEnd;
  if (!parsedRuleStart) return FieldError.ISOInvalidRuleStart;
  if (ruleEndTime < ruleStartTime) return FieldError.RuleEndBeforeStart;
  if (ruleEndTime < currentTime) return FieldError.RuleEndDatePassed;
  return true;
}

export function isValidRuleDuration(
  duration: number
): FieldError.InvalidRuleDuration | FieldError.MaxRuleDuratoinExceeded | true {
  if (duration < MIN_RULE_DURATION_MINUTES)
    return FieldError.InvalidRuleDuration;
  if (duration > MAX_RULE_DURATION_MINUTES)
    return FieldError.MaxRuleDuratoinExceeded;
  return true;
}

export function isValidInterviewFeedback(
  feedback: string
):
  | FieldError.TooLongInterviewFeedback
  | FieldError.TooShortInterviewFeedback
  | FieldError.InvalidInterviewFeedback
  | true {
  const feedbackText = getSafeInnerHtmlText(feedback);

  if (!HTML_REGEX.test(feedback)) return FieldError.InvalidInterviewFeedback;
  if (feedbackText.length < MIN_FEEDBACK_TEXT_LENGTH)
    return FieldError.TooShortInterviewFeedback;
  if (feedbackText.length > MAX_FEEDBACK_TEXT_LENGTH)
    return FieldError.TooLongInterviewFeedback;
  return true;
}
export function isValidInterviewNote(
  note: string
):
  | FieldError.TooLongInterviewNote
  | FieldError.TooShortInterviewNote
  | FieldError.InvalidInterviewNote
  | true {
  const noteText = note.replace(HTML_TAGS_REGEX, "");

  if (!HTML_REGEX.test(note)) return FieldError.InvalidInterviewNote;
  if (noteText.length < MIN_NOTE_TEXT_LENGTH)
    return FieldError.TooShortInterviewNote;
  if (noteText.length > MAX_NOTE_TEXT_LENGTH)
    return FieldError.TooLongInterviewNote;
  return true;
}

export function isValidInterviewLevel(
  level: number
): FieldError.TooLowInterviewLevel | FieldError.TooHighInterviewLevel | true {
  if (level < MIN_INTERVIEW_LEVEL) return FieldError.TooLowInterviewLevel;
  if (level > MAX_INTERVIEW_LEVEL) return FieldError.TooHighInterviewLevel;
  return true;
}

export function isValidRatingValue(
  ratingValue: number
): FieldError.TooLowRatingValue | FieldError.TooHighRatingValue | true {
  if (ratingValue < MIN_RATING_VALUE) return FieldError.TooLowRatingValue;
  if (ratingValue > MAX_RATING_VALUE) return FieldError.TooHighRatingValue;
  return true;
}

export function isValidRatingText(
  ratingText: string
): FieldError.TooLongRatingText | FieldError.TooShortRatingText | true {
  if (ratingText.length > MAX_RATING_TEXT_LENGTH)
    return FieldError.TooLongRatingText;
  if (ratingText.length < MIN_RATING_TEXT_LENGTH)
    return FieldError.TooShortRatingText;
  return true;
}

export function isValidPlanAlias(
  planAlias: string
): FieldError.TooLongPlanAlias | FieldError.TooShortPlanAlias | true {
  if (planAlias.length > MAX_PLAN_ALIAS_LENGTH)
    return FieldError.TooLongPlanAlias;
  if (planAlias.length < MIN_PLAN_ALIAS_LENGTH)
    return FieldError.TooShortPlanAlias;
  return true;
}
export function isValidPlanWeeklyMinutes(
  weeklyMinutes: number
):
  | FieldError.MaxPlanWeeklyMinutesExceeded
  | FieldError.EmptyPlanWeeklyMinutes
  | true {
  if (weeklyMinutes > MAX_PLAN_WEEKLY_MINUTES)
    return FieldError.MaxPlanWeeklyMinutesExceeded;
  if (weeklyMinutes <= MIN_PLAN_WEEKLY_MINUTES)
    return FieldError.EmptyPlanWeeklyMinutes;
  return true;
}
export function isValidPlanPrice(
  price: number,
  discount: number
):
  | FieldError.ZeroPlanPrice
  | FieldError.InfinitePlanPrice
  | FieldError.PlanTotalDiscount
  | FieldError.PlanPriceNotInteger
  | true {
  const priceAfterDiscount = price - (price * discount) / 100;

  if (price <= 0) return FieldError.ZeroPlanPrice;
  if (!Number.isFinite(price)) return FieldError.InfinitePlanPrice;
  if (priceAfterDiscount <= 0) return FieldError.PlanTotalDiscount;
  if (!Number.isInteger(price)) return FieldError.PlanPriceNotInteger;
  return true;
}
export function isValidPlanDiscount(
  discount: number
):
  | FieldError.MinPlanDiscountSubceeded
  | FieldError.PlanTotalDiscount
  | FieldError.MaxPlanDiscountExceeded
  | true {
  if (discount < MIN_PLAN_DISCOUNT) return FieldError.MinPlanDiscountSubceeded;
  if (discount == MIN_PLAN_DISCOUNT) return FieldError.PlanTotalDiscount;
  if (discount > MAX_PLAN_DISCOUNT) return FieldError.MaxPlanDiscountExceeded;
  return true;
}

export function isValidCouponCode(
  couponCode: string
): FieldError.InvalidCouponCode | true {
  if (!COUPON_REGEX.test(couponCode)) return FieldError.InvalidCouponCode;
  return true;
}
export function isValidCouponDiscount(
  couponDiscount: number
): FieldError.ZeroCouponDiscount | FieldError.MaxCouponDiscountExceeded | true {
  if (couponDiscount <= MIN_DISCOUNT_VALUE)
    return FieldError.ZeroCouponDiscount;
  if (couponDiscount > MAX_DISCOUNT_VALUE)
    return FieldError.MaxCouponDiscountExceeded;
  return true;
}
export function isValidCouponExpireDate(
  expireDate: string
):
  | FieldError.ExpiredCouponExpireDate
  | FieldError.InvalidCouponExpireDate
  | true {
  if (!Date.parse(expireDate)) return FieldError.InvalidCouponExpireDate;
  if (new Date() > new Date(expireDate))
    return FieldError.ExpiredCouponExpireDate;
  return true;
}

export function isValidMessageText(
  message: string
):
  | FieldError.InvalidMessageText
  | FieldError.TooLongMessageText
  | FieldError.TooShortMessageText
  | true {
  const text = getSafeInnerHtmlText(message);

  if (!HTML_REGEX.test(message)) return FieldError.InvalidMessageText;
  if (text.length > MAX_MESSAGE_TEXT_LENGTH)
    return FieldError.TooLongMessageText;
  if (text.length < MIN_MESSAGE_TEXT_LENGTH)
    return FieldError.TooShortMessageText;
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
  type: WithdrawMethod,
  bankName?: Bank
) {
  if (type === WithdrawMethod.Wallet) {
    if (!PHONE_NUMBER_REGEX.test(receiver))
      return FieldError.InvalidPhoneNumber;
    return true;
  }
  if (type === WithdrawMethod.Instapay) {
    if (!INSTAPAY_REGEX.test(receiver)) return FieldError.InvalidInstapayIPA;
    return true;
  }
  if (type === WithdrawMethod.Bank) {
    if (!bankName) return FieldError.EmptyBankName;
    if (!Object.values(Bank).includes(bankName)) {
      return FieldError.InvalidBankName;
    }
  }
}
export function isValidInvoiceAmount(
  invoiceAmount: number,
  minAmount: number,
  maxAmount: number
):
  | FieldError.ZeroInvoiceAmount
  | FieldError.InvoiceMinAmountSubceeded
  | FieldError.InvoiceMaxAmountExceeded
  | true {
  if (invoiceAmount <= 0) return FieldError.ZeroInvoiceAmount;
  if (invoiceAmount < minAmount) return FieldError.InvoiceMinAmountSubceeded;
  if (invoiceAmount > maxAmount) return FieldError.InvoiceMaxAmountExceeded;
  return true;
}
export function isValidInvoiceNote(
  invoiceNote: string
):
  | FieldError.EmptyInvoiceNote
  | FieldError.InvalidInvoiceNote
  | FieldError.TooLongInvoiceNote
  | true {
  const noteText = getSafeInnerHtmlText(invoiceNote);
  if (noteText.length <= 0) return FieldError.EmptyInvoiceNote;
  if (!HTML_REGEX.test(invoiceNote)) return FieldError.InvalidInvoiceNote;
  if (noteText.length > 1000) return FieldError.TooLongInvoiceNote;
  return true;
}
