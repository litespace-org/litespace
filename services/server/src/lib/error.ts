import { ApiError, ApiErrorCode } from "@litespace/types";
import { ResponseError } from "@litespace/utils/error";

const error = (errorCode: ApiErrorCode, statusCode: number) =>
  new ResponseError({
    errorCode,
    statusCode,
  });

export const apierror = error;

export const unauthenticated = () => error(ApiError.Unauthenticated, 401);

export const forbidden = () => error(ApiError.Forbidden, 403);

export const bad = () => error(ApiError.BadRequest, 400);

export const conflictingInterview = () =>
  error(ApiError.ConflictingInterview, 409);

export const conflictingLessons = () => error(ApiError.ConflictingLessons, 409);

export const conflictingSchedule = () =>
  error(ApiError.ConflictingSchedule, 409);

export const reachedBookingLimit = () =>
  error(ApiError.ReachedBookingLimit, 409);

export const empty = () => error(ApiError.EmptyRequest, 400);

export const busyTutor = () => error(ApiError.BusyTutor, 400);

export const busyTutorManager = () => error(ApiError.BusyTutorManager, 400);

export const unexpected = () => error(ApiError.Unexpected, 500);

export const serviceUnavailable = () => error(ApiError.ServiceUnavailable, 503);

export const illegalInvoiceUpdate = () =>
  error(ApiError.IllegalInvoiceUpdate, 400);

export const emailAlreadyVerified = () =>
  error(ApiError.EmailAlreadyVerified, 400);

export const wrongPassword = () => error(ApiError.WrongPassword, 400);

export const interviewAlreadySigned = () =>
  error(ApiError.InterviewAlreadySigned, 400);

export const exists = {
  room: () => error(ApiError.RoomExists, 400),
  user: () => error(ApiError.UserExists, 400),
  rate: () => error(ApiError.RatingExists, 400),
  subscription: () => error(ApiError.SubscriptionExists, 400),
};

export const already = {
  verified: () => error(ApiError.UserAlreadyVerified, 400),
};

export const notfound = {
  base: () => error(ApiError.NotFound, 404),
  user: () => error(ApiError.UserNotFound, 404),
  transaction: () => error(ApiError.TransactionNotFound, 404),
  slot: () => error(ApiError.SlotNotFound, 404),
  tutor: () => error(ApiError.TutorNotFound, 404),
  student: () => error(ApiError.StudentNotFound, 404),
  session: () => error(ApiError.SessionNotFound, 404),
  lesson: () => error(ApiError.LessonNotFound, 404),
  room: () => error(ApiError.RoomNotFound, 404),
  roomMembers: () => error(ApiError.RoomMembersNotFound, 404),
  rating: () => error(ApiError.RatingNotFound, 404),
  subscription: () => error(ApiError.SubscriptionNotFound, 404),
  asset: () => error(ApiError.AssetNotFound, 404),
  coupon: () => error(ApiError.CouponNotFound, 404),
  invite: () => error(ApiError.InviteNotFound, 404),
  interview: () => error(ApiError.InterviewNotFound, 404),
  invoice: () => error(ApiError.InvoiceNotFound, 404),
  plan: () => error(ApiError.PlanNotFound, 404),
  report: () => error(ApiError.ReportNotFound, 404),
  reportReply: () => error(ApiError.ReportReplyNotFound, 404),
  withdrawMethod: () => error(ApiError.WidthdrawMethodNotFound, 404),
  topic: () => error(ApiError.TopicNotFound, 404),
} as const;
