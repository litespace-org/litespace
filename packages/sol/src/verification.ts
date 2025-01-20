import {
  ARABIC_LETTERS_REGEX,
  BIO_REGEX,
  COUPON_REGEX,
  EMAIL_REGEX,
  HTML_REGEX,
  HTML_TAGS_REGEX,
  INSTAPAY_REGEX,
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
  MAX_TOPIC_LEGNTH,
  MAX_TUTOR_ABOUT_TEXT_LENGTH,
  MAX_TUTOR_BIO_TEXT_LENGTH,
  MAX_TUTOR_NOTICE_DURATION,
  MAX_USER_AGE,
  MAX_USER_NAME_LENGTH,
  MIN_BIO_LEGNTH,
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
  MIN_RULE_DATE_PERIOD_HOURS,
  MIN_RULE_DURATION_MINUTES,
  MIN_RULE_TITLE_LENGTH,
  MIN_TOPIC_LEGNTH,
  MIN_TUTOR_NOTICE_DURATION,
  MIN_USER_AGE,
  MIN_USER_NAME_LENGTH,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
  USER_NAME_REGEX,
} from "@/constants";
import { banks, FieldError, WithdrawMethod, type Bank } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";
import { dayjs } from "@/dayjs";

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

export function isValidPhoneNumber(phone: unknown) {
  if (typeof phone !== "string" || !PHONE_NUMBER_REGEX.test(phone))
    return FieldError.InvalidPhoneNumber;
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

export function isValidTutorBio(
  bio: unknown
):
  | FieldError.EmptyBio
  | FieldError.ShortBio
  | FieldError.LongBio
  | FieldError.InvalidBio
  | true {
  if (typeof bio !== "string") return FieldError.InvalidBio;
  if (!bio.length) return FieldError.EmptyBio;
  if (bio.length < MIN_BIO_LEGNTH) return FieldError.ShortBio;
  if (!BIO_REGEX.test(bio)) return FieldError.InvalidBio;
  if (bio.length > MAX_TUTOR_BIO_TEXT_LENGTH) return FieldError.LongBio;
  return true;
}

export function isValidTutorAbout(
  about: string
): FieldError.EmptyTutorAbout | FieldError.LongTutorAbout | true {
  const tutorAboutText = getSafeInnerHtmlText(about);
  if (!tutorAboutText.length) return FieldError.EmptyTutorAbout;
  if (tutorAboutText.length > MAX_TUTOR_ABOUT_TEXT_LENGTH)
    return FieldError.LongTutorAbout;
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
):
  | FieldError.ShortRuleTitle
  | FieldError.LongRuleTitle
  | FieldError.InvalidRuleTitle
  | true {
  if (title.length < MIN_RULE_TITLE_LENGTH) return FieldError.ShortRuleTitle;
  if (!ARABIC_LETTERS_REGEX.test(title)) return FieldError.InvalidRuleTitle;
  if (title.length > MAX_RULE_TITLE_LENGTH) return FieldError.LongRuleTitle;
  return true;
}

/**
 * Validate rule start and end date
 */
export function isValidRuleBounds(
  start: string,
  end: string
):
  | FieldError.InvalidRuleStartFormat
  | FieldError.InvalidRuleEndFormat
  | FieldError.RuleStartAfterEnd
  | FieldError.RuleStartDatePassed
  | FieldError.RuleEndDatePassed
  | FieldError.InvalidRuleDatePeriod
  | true {
  const ruleStart = dayjs.utc(start);
  const ruleEnd = dayjs.utc(end);

  if (!ruleStart.isValid()) return FieldError.InvalidRuleStartFormat;
  if (!ruleEnd.isValid()) return FieldError.InvalidRuleEndFormat;

  if (ruleStart.isAfter(ruleEnd)) return FieldError.RuleStartAfterEnd;
  if (dayjs.utc().isAfter(ruleStart)) return FieldError.RuleStartDatePassed;
  if (dayjs.utc().isAfter(ruleEnd)) return FieldError.RuleEndDatePassed;
  if (ruleStart.add(MIN_RULE_DATE_PERIOD_HOURS, "hours").isAfter(ruleEnd))
    return FieldError.InvalidRuleDatePeriod;

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
    if (!Object.values(banks).includes(bankName)) {
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

export function isValidTopicName(
  name: string
): FieldError.ShortTopicName | FieldError.LongTopicName | true {
  if (name.length < MIN_TOPIC_LEGNTH) return FieldError.ShortTopicName;
  if (name.length > MAX_TOPIC_LEGNTH) return FieldError.LongTopicName;
  return true;
}
