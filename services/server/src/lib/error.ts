import { ApiErrorCode } from "@litespace/types";
import { ResponseError } from "@litespace/utils/error";

const error = (errorCode: ApiErrorCode, statusCode: number, message?: string) =>
  new ResponseError({
    errorCode,
    statusCode,
    message,
  });

export const apierror = error;

export const unauthenticated = () =>
  error("unauthenticated" as ApiErrorCode, 401);

export const forbidden = (msg?: string) =>
  error("forbidden" as ApiErrorCode, 403, msg);

export const subscriptionRequired = () =>
  error("subscription-required" as ApiErrorCode, 403);

export const noEnoughMinutes = () =>
  error("no-enough-minutes" as ApiErrorCode, 403);

export const bad = (message?: string) =>
  error("bad-request" as ApiErrorCode, 400, message);

export const largeFileSize = () =>
  error("large-file-size" as ApiErrorCode, 400);

export const conflictingInterview = () =>
  error("conflicting-interview" as ApiErrorCode, 409);

export const conflictingLessons = () =>
  error("conflicting-lessons" as ApiErrorCode, 409);

export const conflictingSchedule = () =>
  error("conflicting-schedule" as ApiErrorCode, 409);

export const reachedBookingLimit = () =>
  error("reached-booking-limit" as ApiErrorCode, 409);

export const empty = () => error("empty-request" as ApiErrorCode, 400);

export const busyTutor = () => error("busy-tutor" as ApiErrorCode, 400);

export const busyTutorManager = () =>
  error("busy-tutor-manager" as ApiErrorCode, 400);

export const unexpected = (msg?: string) =>
  error("unexpected" as ApiErrorCode, 500, msg);

export const serviceUnavailable = () =>
  error("service-unavailable" as ApiErrorCode, 503);

export const illegalInvoiceUpdate = () =>
  error("illegal-invoice-update" as ApiErrorCode, 400);

export const emailAlreadyVerified = () =>
  error("email-already-verified" as ApiErrorCode, 400);

export const phoneAlreadyVerified = () =>
  error("phone-already-verified" as ApiErrorCode, 400);

export const incorrectPhone = () =>
  error("incorrect-phone" as ApiErrorCode, 400);

export const invalidPhone = () => error("invalid-phone" as ApiErrorCode, 400);

export const unresolvedPhone = () =>
  error("unresolved-phone" as ApiErrorCode, 403);

export const expiredVerificationCode = () =>
  error("expired-verification-code" as ApiErrorCode, 410);

export const invalidVerificationCode = () =>
  error("invalid-verification-code" as ApiErrorCode, 400);

export const wrongPassword = () => error("wrong-password" as ApiErrorCode, 400);

export const fawryError = (msg?: string) =>
  error("fawry-error" as ApiErrorCode, 500, msg);

export const exists = {
  room: () => error("room-exists" as ApiErrorCode, 400),
  user: () => error("user-exists" as ApiErrorCode, 400),
  rate: () => error("rating-exists" as ApiErrorCode, 400),
  subscription: () => error("subscription-exists" as ApiErrorCode, 400),
};

export const already = {
  verified: () => error("user-already-verified" as ApiErrorCode, 400),
};

export const notfound = {
  base: () => error("not-found" as ApiErrorCode, 404),
  user: () => error("user-not-found" as ApiErrorCode, 404),
  transaction: () => error("transaction-not-found" as ApiErrorCode, 404),
  slot: () => error("slot-not-found" as ApiErrorCode, 404),
  tutor: () => error("tutor-not-found" as ApiErrorCode, 404),
  student: () => error("student-not-found" as ApiErrorCode, 404),
  session: () => error("session-not-found" as ApiErrorCode, 404),
  lesson: () => error("lesson-not-found" as ApiErrorCode, 404),
  room: () => error("room-not-found" as ApiErrorCode, 404),
  roomMembers: () => error("room-members-not-found" as ApiErrorCode, 404),
  rating: () => error("rating-not-found" as ApiErrorCode, 404),
  subscription: () => error("subscription-not-found" as ApiErrorCode, 404),
  asset: () => error("asset-not-found" as ApiErrorCode, 404),
  coupon: () => error("coupon-not-found" as ApiErrorCode, 404),
  invite: () => error("invite-not-found" as ApiErrorCode, 404),
  interview: () => error("interview-not-found" as ApiErrorCode, 404),
  invoice: () => error("invoice-not-found" as ApiErrorCode, 404),
  plan: () => error("plan-not-found" as ApiErrorCode, 404),
  report: () => error("report-not-found" as ApiErrorCode, 404),
  withdrawMethod: () => error("withdraw-method-not-found" as ApiErrorCode, 404),
  topic: () => error("topic-not-found" as ApiErrorCode, 404),
} as const;
