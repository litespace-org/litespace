import { ApiError, ApiErrorCode, FieldError } from "@litespace/types";

export async function safe<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}

export async function safePromise<T>(promise: Promise<T>) {
  try {
    return await promise;
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "string" &&
    Object.values(ApiError).includes(value as ApiError)
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
    (error.statusCode === 401 || error.errorCode === ApiError.Forbidden)
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
  }: {
    errorCode: ApiErrorCode;
    statusCode: number;
  }) {
    super(errorCode);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
