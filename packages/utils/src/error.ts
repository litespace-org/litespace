import { ApiError, ApiErrorCode, FieldError } from "@litespace/types";

export async function safe<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}

export async function safePromise<T>(promise: Promise<T>): Promise<T | Error> {
  try {
    return await promise;
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "string" &&
    [
      "unauthenticated",
      "forbidden",
      "bad-request",
      "room-exists",
      "user-exists",
      "rating-exists",
      "subscription-exists",
      "subscription-required",
      "no-enough-minutes",
      "busy-tutor",
      "busy-tutor-manager",
      "unexpected",
      "not-found",
      "session-not-found",
      "transaction-not-found",
      "user-not-found",
      "tutor-not-found",
      "student-not-found",
      "lesson-not-found",
      "slot-not-found",
      "rating-not-found",
      "coupon-not-found",
      "asset-not-found",
      "invite-not-found",
      "invoice-not-found",
      "plan-not-found",
      "room-not-found",
      "room-members-not-found",
      "report-not-found",
      "interview-not-found",
      "topic-not-found",
      "withdraw-method-not-found",
      "subscription-not-found",
      "email-already-verified",
      "phone-already-verified",
      "unresolved-phone",
      "invalid-phone",
      "incorrect-phone",
      "expired-verification-code",
      "invalid-verification-code",
      "illegal-invoice-update",
      "empty-request",
      "user-already-verified",
      "wrong-password",
      "conflicting-lessons",
      "conflicting-interview",
      "conflicting-schedule",
      "reached-booking-limit",
      "service-unavailable",
      "fawry-error",
      "large-file-size",
    ].includes(value as ApiError)
  );
}

// Assuming FieldError is another type
export function isFieldError(value: unknown): value is FieldError {
  return (
    typeof value === "string" &&
    Object.values(FieldError).includes(value as FieldError)
  );
}

export function isForbidden(error: unknown) {
  return (
    error instanceof ResponseError &&
    (error.statusCode === 401 || error.errorCode === "forbidden")
  );
}

export function isRateLimited(error: unknown) {
  return (
    (error &&
      typeof error == "object" &&
      "status" in error &&
      error.status == 429) ||
    (error instanceof ResponseError && error.statusCode === 429)
  );
}

export class ResponseError extends Error {
  statusCode: number;
  errorCode: ApiErrorCode;

  constructor({
    errorCode,
    statusCode,
    message,
  }: {
    errorCode: ApiErrorCode;
    statusCode: number;
    message?: string;
  }) {
    super(message || errorCode);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
