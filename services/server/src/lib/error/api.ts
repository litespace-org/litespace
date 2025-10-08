import { ApiError, ApiErrorCode } from "@litespace/types";
import { ResponseError } from "@litespace/utils/error";

const error = (errorCode: ApiErrorCode, statusCode: number, message?: string) =>
  new ResponseError({
    errorCode,
    statusCode,
    message,
  });

export const apierror = error;

export const unauthenticated = () => error(ApiError.Unauthenticated, 401);

export const forbidden = (msg?: string) => error(ApiError.Forbidden, 403, msg);

export const subscriptionRequired = () =>
  error(ApiError.SubscriptionRequired, 403);

export const subscriptionUncancellable = () =>
  error(ApiError.SubscriptionUncancellable, 403);

export const bad = (message?: string) =>
  error(ApiError.BadRequest, 400, message);

export const shortVideoDur = (message?: string) =>
  error(ApiError.ShortVideoDur, 400, message);

export const longVideoDur = (message?: string) =>
  error(ApiError.LongVideoDur, 400, message);

export const largeFileSize = () => error(ApiError.LargeFileSize, 400);

export const conflictingInterview = () =>
  error(ApiError.ConflictingInterview, 409);

export const illegal = () => error(ApiError.Illegal, 409);

export const conflictingLessons = () => error(ApiError.ConflictingLessons, 409);

export const lessonTimePassed = () => error(ApiError.LessonTimePassed, 409);

export const lessonNotStarted = () => error(ApiError.LessonNotStarted, 409);

export const lessonAlreadyStarted = () =>
  error(ApiError.LessonAlreadyStarted, 409);

export const conflictingSchedule = () =>
  error(ApiError.ConflictingSchedule, 409);

export const reachedBookingLimit = () =>
  error(ApiError.ReachedBookingLimit, 409);

export const empty = () => error(ApiError.EmptyRequest, 400);

export const busyTutor = () => error(ApiError.BusyTutor, 400);

export const invalidEmail = () => error(ApiError.InvalidEmail, 400);

export const busyTutorManager = () => error(ApiError.BusyTutorManager, 400);

export const unexpected = (msg?: string) =>
  error(ApiError.Unexpected, 500, msg);

export const serviceUnavailable = () => error(ApiError.ServiceUnavailable, 503);

export const illegalInvoiceUpdate = () =>
  error(ApiError.IllegalInvoiceUpdate, 400);

export const emailAlreadyVerified = () =>
  error(ApiError.EmailAlreadyVerified, 400);

export const phoneAlreadyVerified = () =>
  error(ApiError.PhoneAlreadyVerified, 400);

export const incorrectPhone = () => error(ApiError.IncorrectPhone, 400);

export const invalidPhone = () => error(ApiError.InvalidPhone, 400);

export const unresolvedPhone = () => error(ApiError.UnresolvedPhone, 403);

export const unverifiedPhone = () => error(ApiError.UnverifiedPhone, 403);

export const expiredVerificationCode = () =>
  error(ApiError.ExpiredVerificationCode, 410);

export const invalidVerificationCode = () =>
  error(ApiError.InvalidVerificationCode, 400);

export const inActiveTutorManager = () =>
  error(ApiError.InvalidVerificationCode, 400);

export const invalidUserName = () => error(ApiError.InvalidUserName, 400);

export const phoneRequired = () => error(ApiError.PhoneRequired, 400);

export const wrongPassword = () => error(ApiError.WrongPassword, 401);

export const noPassword = () => error(ApiError.NoPassword, 401);

export const fawryError = (msg?: string) =>
  error(ApiError.FawryError, 500, msg);

export const exists = {
  room: () => error(ApiError.RoomExists, 409),
  user: () => error(ApiError.UserExists, 409),
  rate: () => error(ApiError.RatingExists, 409),
  subscription: () => error(ApiError.SubscriptionExists, 409),
  introVideo: () => error(ApiError.IntroVideoExists, 409),
  demoSession: () => error(ApiError.DemoSessionExists, 409),
};

export const already = {
  verified: () => error(ApiError.UserAlreadyVerified, 409),
};

export const notRoomMember = () => error(ApiError.NotRoomMember, 403);

export const notfound = {
  base: () => error(ApiError.NotFound, 404),
  user: () => error(ApiError.UserNotFound, 404),
  transaction: () => error(ApiError.TransactionNotFound, 404),
  slot: () => error(ApiError.SlotNotFound, 404),
  demoSession: () => error(ApiError.DemoSessionNotFound, 404),
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
  introVideo: () => error(ApiError.IntroVideoNotFound, 404),
  plan: () => error(ApiError.PlanNotFound, 404),
  report: () => error(ApiError.ReportNotFound, 404),
  withdrawMethod: () => error(ApiError.WidthdrawMethodNotFound, 404),
  topic: () => error(ApiError.TopicNotFound, 404),
} as const;
