import { ApiErrorCode } from "@litespace/types";
export async function safe<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return error instanceof Error ? error : new Error("unkown");
  }
}

type CodedError = {
  message: string;
  code: ApiErrorCode;
};

// api error handling
export class ResponseError extends Error {
  statusCode: number;
  errorCode: ApiErrorCode;

  constructor(error: CodedError, statusCode: number) {
    super(error.message);
    this.statusCode = statusCode;
    this.errorCode = error.code;
  }
}
