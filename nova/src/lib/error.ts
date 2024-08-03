import { AxiosError, isAxiosError } from "axios";

enum ErrorCode {
  Unkown = "unkown",
}

/**
 * Error message with error code
 */
type CodedError = {
  message: string;
  code: ErrorCode;
};

export type PossibleError<T> = MultiError | T;

export class MultiError extends Error {
  public readonly errorCode: ErrorCode;

  constructor(error: unknown) {
    const err = parseErrorMessage(error);
    if (!err) throw new Error("Unsupported error type");

    super(err.message);
    this.errorCode = err.code;
  }
}

export async function safe<T>(
  callback: () => Promise<T>
): Promise<PossibleError<T>> {
  try {
    return await callback();
  } catch (error) {
    return new MultiError(error);
  }
}

function parseErrorMessage(error: unknown): CodedError | null {
  if (isAxiosError(error)) return parseAxiosError(error);
  if (error instanceof Error)
    return { message: error.message, code: ErrorCode.Unkown };
  return null;
}

function parseAxiosError(
  error: AxiosError<{ message: string; code: ErrorCode }>
): CodedError | null {
  const data = error.response?.data;
  if (!data) return null;
  return { message: data.message, code: data.code };
}
