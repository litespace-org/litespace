export enum FieldError {
  InvalidEmail = "invalid-email",
  ShortPassword = "short-password",
  LongPassword = "long-password",
  InvalidPassword = "invalid-password",
  InvalidUserName = "invalid-user-name",
  ShortUserName = "short-user-name",
  LongUserName = "long-user-name",
  OldUser = "old-user",
  YoungUser = "young-user",
  EmptyBio = "empty-bio",
  LongBio = "long-bio",
  ShortBio = "short-bio",
  InvalidBio = "invalid-bio",
  EmptyTutorAbout = "empty-tutor-about",
  LongTutorAbout = "long-tutor-about",
  MaxNoticeExceeded = "max-notice-exceeded",
  InvalidNotice = "invalid-notice",
  InvalidInterviewFeedback = "interveiw-feedback-invalid-html",
  TooShortInterviewFeedback = "interveiw-feedback-too-short",
  TooLongInterviewFeedback = "interveiw-feedback-too-long",
  InvalidInterviewNote = "interveiw-note-invalid-html",
  TooShortInterviewNote = "interveiw-note-too-short",
  TooLongInterviewNote = "interveiw-note-too-long",
  TooLowInterviewLevel = "too-low-interveiw-level",
  TooHighInterviewLevel = "too-high-interveiw-level",
  TooLowRatingValue = "too-high-rating-value",
  TooHighRatingValue = "too-low-rating-value",
  TooLongRatingText = "too-long-rating-text",
  TooShortRatingText = "too-short-rating-text",
  TooLongPlanAlias = "too-long-plan-alias",
  TooShortPlanAlias = "too-short-plan-alias",
  MaxPlanWeeklyMinutesExceeded = "max-weekly-minutes-exceeded",
  EmptyPlanWeeklyMinutes = "empty-weekly-minutes",
  PlanPriceNotInteger = "price-not-integer",
  PlanTotalDiscount = "plan-total-discount",
  NegativePlanPrice = "negative-plan-price",
  InfinitePlanPrice = "infinte-plan-price",
  ZeroPlanPrice = "zero-plan-discount",
  MaxPlanDiscountExceeded = "max-plan-discount-exceeded",
  MinPlanDiscountSubceeded = "min-plan-discount-subceeded",
  InvalidCouponCode = "coupon-code-invalid",
  ZeroCouponDiscount = "zero-coupon-discount",
  MaxCouponDiscountExceeded = "max-coupon-discount-exceeded",
  InvalidCouponExpireDate = "expire-date-invalid",
  ExpiredCouponExpireDate = "expired-coupone-expire-date",
  InvalidMessageText = "message-text-invalid-html",
  TooLongMessageText = "message-text-too-long",
  TooShortMessageText = "message-text-too-short",
  WithdrawMinAmountAboveMaxAmount = "withdraw-min-amount-above-max-amount",
  WithdrawMaxAmountZeroOrNegative = "withdraw-max-amount-zero-or-negative",
  WithdrawMinAmountZeroOrNegative = "withdraw-min-amount-zero-or-nagative",
  ZeroInvoiceAmount = "invoice-amount-zero-or-negative",
  InvoiceMinAmountSubceeded = "invoice-min-amount-subceeded",
  InvoiceMaxAmountExceeded = "invoice-max-amount-exceeded",
  EmptyInvoiceNote = "empty-invoice-note",
  InvalidInvoiceNote = "invoice-note-invalid-html",
  TooLongInvoiceNote = "invoice-note-too-long",
  InvalidPhoneNumber = "phone-number-invalid",
  InvalidInstapayIPA = "instapay-username-invalid",
  EmptyBankName = "empty-bank-name",
  InvalidBankName = "invalid-bank-name",
  ShortTopicName = "short-topic-name",
  LongTopicName = "long-topic-name",
}
