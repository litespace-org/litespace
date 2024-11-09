import { FieldError } from "@/verification";

export enum ApiError {
  Forbidden = "forbidden",
  BadRequest = "bad-request",
  RoomExists = "room-exists",
  UserExists = "room-exists",
  RatingExists = "rating-exists",
  SubscriptionExists = "subscription-exists",
  BusyTutor = "busy-tutor",
  BusyTutorManager = "busy-tutor-manager",
  Unexpected = "unexpected",
  NotFound = "not-found",
  CallNotFound = "call-not-found",
  UserNotFound = "user-not-found",
  TutorNotFound = "tutor-not-found",
  StudentNotFound = "student-not-found",
  LessonNotFound = "lesson-not-found",
  RuleNotFound = "rule-not-found",
  RatingNotFound = "rating-not-found",
  CouponNotFound = "coupon-not-found",
  AssetNotFound = "asset-not-found",
  InviteNotFound = "invite-not-found",
  InvoiceNotFound = "invoice-not-found",
  PlanNotFound = "plan-not-found",
  RoomNotFound = "room-not-found",
  RoomMembersNotFound = "room-members-not-found",
  ReportNotFound = "report-not-found",
  InterviewNotFound = "interview-not-found",
  TopicNotFound = "topic-not-found",
  InterviewAlreadySigned = "interview-already-signed",
  ReportReplyNotFound = "report-reply-not-found",
  WidthdrawMethodNotFound = "withdraw-method-not-found",
  SubscriptionNotFound = "subscription-not-found",
  EmailAlreadyVerified = "email-already-verified",
  IllegalInvoiceUpdate = "illegal-invoice-update",
  ContradictingRules = "contradicting-rules",
  EmptyUpdateRequest = "empty-update-request",
}

export type ApiErrorCode = ApiError | FieldError;

export enum Backend {
  Staging = "staging",
  Local = "local",
  Production = "production",
}
