import { apiErrorMap } from "@/constants/error";
import { LocalId } from "@/locales";
import { ResponseError, isApiError } from "@litespace/utils/error";

/**
 * Checks if the provided value contains the structure of a ResponseError.
 * If valid, creates and returns a new ResponseError instance. Otherwise, returns null.
 *
 * @param value - The value to check and potentially transform into a ResponseError.
 * @returns {ResponseError | null} - A new ResponseError instance if the value is valid, otherwise null.
 */
function responseErrorValidator(value: unknown) {
  if (!value) return null;
  const isObject = typeof value === "object";
  const errorCode =
    isObject && "errorCode" in value && isApiError(value.errorCode)
      ? value.errorCode
      : null;
  const statusCode =
    isObject && "statusCode" in value && typeof value.statusCode === "number"
      ? value.statusCode
      : null;
  const message =
    isObject && "message" in value && typeof value.message === "string"
      ? value.message
      : null;

  if (!errorCode || !statusCode || !message) return null;
  return new ResponseError({ message, errorCode, statusCode });
}

export function getErrorMessageId(error: unknown): LocalId {
  // Check if the error is an instance of ResponseError
  if (error instanceof ResponseError) {
    // If it's a ResponseError, return the mapped error message ID
    return apiErrorMap[error.errorCode] || "error.unexpected";
  }

  const response = responseErrorValidator(error);

  if (response) return apiErrorMap[response.errorCode];

  // Default to unexpected error if the error structure doesn't match
  return "error.unexpected";
}
