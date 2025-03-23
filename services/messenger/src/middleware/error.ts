import { NextFunction, Request, Response } from "express";
import { AxiosError } from "axios";
import { first } from "lodash";
import { ZodError } from "zod";

import { ResponseError } from "@litespace/utils/error";
import { ApiErrorCode, ApiError } from "@litespace/types";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function errorHandler(
  error: Error | ResponseError | ZodError | AxiosError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  let statusCode = 500;
  let message = "Unexpected error, please retry";
  let errorCode: ApiErrorCode = ApiError.Unexpected;

  if (error instanceof ResponseError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = error.errorCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = getZodMessage(error);
  } else if (error instanceof AxiosError) {
    message = error.response?.data ? error.response.data : error.message;
    statusCode = error.response?.status || 400;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return res.status(statusCode).json({ message, code: errorCode });
}
