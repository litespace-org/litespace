import { apiErrorMap } from "@/constants/error";
import { LocalId } from "@/locales";
import { ResponseError } from "@litespace/utils/error";

export function getErrorMessageId(error: unknown): LocalId {
  if (error instanceof ResponseError) return apiErrorMap[error.errorCode];
  return "error.unexpected";
}
