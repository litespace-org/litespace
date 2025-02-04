import { LocalId } from "@/locales";
import { ApiError, ApiErrorCode, FieldError } from "@litespace/types";

export const apiErrorMap: Record<ApiErrorCode, LocalId> = {
  [ApiError.Forbidden]: "error.api.forbidden",
  [ApiError.BadRequest]: "error.api.bad-request",
  [ApiError.RoomExists]: "error.api.room-exists",
  [ApiError.UserExists]: "error.api.user-exists",
  [ApiError.RatingExists]: "error.api.rating-exists",
  [ApiError.SubscriptionExists]: "error.api.subscription-exists",
  [ApiError.BusyTutor]: "error.api.busy-tutor",
  [ApiError.BusyTutorManager]: "error.api.busy-tutor-manager",
  [ApiError.Unexpected]: "error.api.unexpected",
  [ApiError.NotFound]: "error.api.not-found",
  [ApiError.SessionNotFound]: "error.api.session-not-found",
  [ApiError.UserNotFound]: "error.api.user-not-found",
  [ApiError.TutorNotFound]: "error.api.tutor-not-found",
  [ApiError.StudentNotFound]: "error.api.student-not-found",
  [ApiError.LessonNotFound]: "error.api.lesson-not-found",
  [ApiError.SlotNotFound]: "error.api.slot-not-found",
  [ApiError.RatingNotFound]: "error.api.rating-not-found",
  [ApiError.CouponNotFound]: "error.api.coupon-not-found",
  [ApiError.AssetNotFound]: "error.api.asset-not-found",
  [ApiError.InviteNotFound]: "error.api.invite-not-found",
  [ApiError.InvoiceNotFound]: "error.api.invoice-not-found",
  [ApiError.PlanNotFound]: "error.api.plan-not-found",
  [ApiError.RoomNotFound]: "error.api.room-not-found",
  [ApiError.RoomMembersNotFound]: "error.api.room-members-not-found",
  [ApiError.ReportNotFound]: "error.api.report-not-found",
  [ApiError.InterviewNotFound]: "error.api.interview-not-found",
  [ApiError.TopicNotFound]: "error.api.topic-not-found",
  [ApiError.InterviewAlreadySigned]: "error.api.interview-already-signed",
  [ApiError.ReportReplyNotFound]: "error.api.report-reply-not-found",
  [ApiError.WidthdrawMethodNotFound]: "error.api.withdraw-method-not-found",
  [ApiError.SubscriptionNotFound]: "error.api.subscription-not-found",
  [ApiError.EmailAlreadyVerified]: "error.api.email-already-verified",
  [ApiError.IllegalInvoiceUpdate]: "error.api.illegal-invoice-update",
  [ApiError.EmptyRequest]: "error.api.empty-request",
  [ApiError.UserAlreadyVerified]: "error.api.user-already-verified",
  [ApiError.WrongPassword]: "error.api.wrong-password",
  [ApiError.Conflict]: "error.api.conflict",
  [FieldError.InvalidEmail]: "error.field.invalid-email",
  [FieldError.ShortPassword]: "error.field.short-password",
  [FieldError.LongPassword]: "error.field.long-password",
  [FieldError.InvalidPassword]: "error.field.invalid-password",
  [FieldError.InvalidUserName]: "error.field.invalid-user-name",
  [FieldError.ShortUserName]: "error.field.short-user-name",
  [FieldError.LongUserName]: "error.field.long-user-name",
  [FieldError.OldUser]: "error.field.old-user",
  [FieldError.YoungUser]: "error.field.young-user",
  [FieldError.EmptyBio]: "error.field.empty-bio",
  [FieldError.LongBio]: "error.field.long-bio",
  [FieldError.ShortBio]: "error.field.short-bio",
  [FieldError.InvalidBio]: "error.field.invalid-bio",
  [FieldError.EmptyTutorAbout]: "error.field.empty-tutor-about",
  [FieldError.LongTutorAbout]: "error.field.long-tutor-about",
  [FieldError.MaxNoticeExceeded]: "error.field.max-notice-exceeded",
  [FieldError.InvalidNotice]: "error.field.invalid-notice",
  [FieldError.InvalidInterviewFeedback]:
    "error.field.invalid-interview-feedback",
  [FieldError.TooShortInterviewFeedback]:
    "error.field.too-short-interview-feedback",
  [FieldError.TooLongInterviewFeedback]:
    "error.field.too-long-interview-feedback",
  [FieldError.InvalidInterviewNote]: "error.field.invalid-interview-note",
  [FieldError.TooShortInterviewNote]: "error.field.too-short-interview-note",
  [FieldError.TooLongInterviewNote]: "error.field.too-long-interview-note",
  [FieldError.TooLowInterviewLevel]: "error.field.too-low-interview-level",
  [FieldError.TooHighInterviewLevel]: "error.field.too-high-interview-level",
  [FieldError.TooLowRatingValue]: "error.field.too-low-rating-value",
  [FieldError.TooHighRatingValue]: "error.field.too-high-rating-value",
  [FieldError.TooLongRatingText]: "error.field.too-long-rating-text",
  [FieldError.TooShortRatingText]: "error.field.too-short-rating-text",
  [FieldError.TooLongPlanAlias]: "error.field.too-long-plan-alias",
  [FieldError.TooShortPlanAlias]: "error.field.too-short-plan-alias",
  [FieldError.PlanPriceNotInteger]: "error.field.plan-price-not-integer",
  [FieldError.PlanTotalDiscount]: "error.field.plan-total-discount",
  [FieldError.NegativePlanPrice]: "error.field.negative-plan-price",
  [FieldError.InfinitePlanPrice]: "error.field.infinite-plan-price",
  [FieldError.ZeroPlanPrice]: "error.field.zero-plan-price",
  [FieldError.MaxPlanWeeklyMinutesExceeded]:
    "error.field.max-weekly-minutes-exceeded",
  [FieldError.EmptyPlanWeeklyMinutes]: "error.field.empty-weekly-minutes",
  [FieldError.MaxPlanDiscountExceeded]:
    "error.field.max-plan-discount-exceeded",
  [FieldError.MinPlanDiscountSubceeded]:
    "error.field.min-plan-discount-subceeded",
  [FieldError.InvalidCouponCode]: "error.field.invalid-coupon-code",
  [FieldError.ZeroCouponDiscount]: "error.field.zero-coupon-discount",
  [FieldError.MaxCouponDiscountExceeded]:
    "error.field.max-coupon-discount-exceeded",
  [FieldError.InvalidCouponExpireDate]:
    "error.field.invalid-coupon-expire-date",
  [FieldError.ExpiredCouponExpireDate]:
    "error.field.expired-coupon-expire-date",
  [FieldError.InvalidMessageText]: "error.field.invalid-message-text",
  [FieldError.TooLongMessageText]: "error.field.too-long-message-text",
  [FieldError.TooShortMessageText]: "error.field.too-short-message-text",
  [FieldError.WithdrawMinAmountAboveMaxAmount]:
    "error.field.withdraw-min-amount-above-max-amount",
  [FieldError.WithdrawMaxAmountZeroOrNegative]:
    "error.field.withdraw-max-amount-zero-or-negative",
  [FieldError.WithdrawMinAmountZeroOrNegative]:
    "error.field.withdraw-min-amount-zero-or-negative",
  [FieldError.ZeroInvoiceAmount]: "error.field.zero-invoice-amount",
  [FieldError.InvoiceMinAmountSubceeded]:
    "error.field.invoice-min-amount-subceeded",
  [FieldError.InvoiceMaxAmountExceeded]:
    "error.field.invoice-max-amount-exceeded",
  [FieldError.EmptyInvoiceNote]: "error.field.empty-invoice-note",
  [FieldError.InvalidInvoiceNote]: "error.field.invalid-invoice-note",
  [FieldError.TooLongInvoiceNote]: "error.field.too-long-invoice-note",
  [FieldError.InvalidPhoneNumber]: "error.field.invalid-phone-number",
  [FieldError.InvalidInstapayIPA]: "error.field.invalid-instapay-ipa",
  [FieldError.EmptyBankName]: "error.field.empty-bank-name",
  [FieldError.InvalidBankName]: "error.field.invalid-bank-name",
  [FieldError.ShortTopicName]: "error.field.short-topic-name",
  [FieldError.LongTopicName]: "error.field.long-topic-name",
};
