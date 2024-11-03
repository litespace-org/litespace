import { ApiError, ApiErrorCode } from "@litespace/types";

type CodedError = {
  message: string;
  code: ApiErrorCode;
};

export default class ResponseError extends Error {
  statusCode: number;
  errorCode: ApiErrorCode;

  constructor(error: CodedError, statusCode: number) {
    super(error.message);
    this.statusCode = statusCode;
    this.errorCode = error.code;
  }
}

const error = (code: ApiErrorCode, message: string, status: number) =>
  new ResponseError(
    {
      code,
      message,
    },
    status
  );

export const forbidden = () =>
  error(ApiError.Forbidden, "unauthorized access", 401);

export const bad = () => error(ApiError.BadRequest, "Bad request", 400);

export const busyTutor = () =>
  error(ApiError.BusyTutor, "Tutor has not time", 400);

export const busyTutorManager = () =>
  error(ApiError.BusyTutorManager, "Tutor manager has not time", 400);

export const unexpected = () =>
  error(ApiError.Unexpected, "unexpected error occurred", 500);

export const illegalInvoiceUpdate = () =>
  error(ApiError.IllegalInvoiceUpdate, "Illegal invoice update", 400);

export const emailAlreadyVerified = () =>
  error(ApiError.EmailAlreadyVerified, "Email already verified", 400);

export const contradictingRules = () =>
  error(
    ApiError.ContradictingRules,
    "Incomding rule is contradicting with existing ones",
    400
  );

export const exists = {
  room: () => error(ApiError.RoomExists, "Room already exist", 400),
  user: () => error(ApiError.UserExists, "User already exist", 400),
  rate: () => error(ApiError.RatingExists, "You already rated this user", 400),
  subscription: () =>
    error(ApiError.SubscriptionExists, "You already subscribed", 400),
};

export const notfound = {
  base: () => error(ApiError.NotFound, "Resource not found", 404),
  user: () => error(ApiError.UserNotFound, "User not found", 404),
  rule: () => error(ApiError.RuleNotFound, "Rule not found", 404),
  tutor: () => error(ApiError.TutorNotFound, "Tutor not found", 404),
  call: () => error(ApiError.CallNotFound, "Call not found", 404),
  lesson: () => error(ApiError.LessonNotFound, "Lesson nto found", 404),
  room: () => error(ApiError.RoomNotFound, "Room not found", 404),
  roomMembers: () =>
    error(ApiError.RoomMembersNotFound, "Room members not found", 404),
  rating: () => error(ApiError.RatingNotFound, "Rating not found", 404),
  subscription: () =>
    error(ApiError.SubscriptionNotFound, "Subscription not found", 404),
  asset: () => error(ApiError.AssetNotFound, "Asset not found", 404),
  coupon: () => error(ApiError.CouponNotFound, "Coupon not found", 404),
  invite: () => error(ApiError.InviteNotFound, "Invite not found", 404),
  interview: () =>
    error(ApiError.InterviewNotFound, "Interview not found", 404),
  invoice: () => error(ApiError.InvoiceNotFound, "Invoice not found", 404),
  plan: () => error(ApiError.PlanNotFound, "Plan not found", 404),
  report: () => error(ApiError.ReportNotFound, "Report not found", 404),
  reportReply: () =>
    error(ApiError.ReportReplyNotFound, "Report reply not found", 404),
  withdrawMethod: () =>
    error(ApiError.WidthdrawMethodNotFound, "Withdraw method not found", 404),
} as const;
