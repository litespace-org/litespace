import { isProduction } from "@/constants";
import { ResponseError } from "@litespace/utils/error";
import { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import { ZodError } from "zod";
import { DatabaseError } from "pg";
import { ApiErrorCode, ApiError } from "@litespace/types";
import { S3ServiceException } from "@aws-sdk/client-s3";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function errorHandler(
  error: Error | DatabaseError | ResponseError | ZodError | AxiosError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (!isProduction) console.error(error);

  let statusCode = 400;
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
  } else if (
    error instanceof DatabaseError ||
    error instanceof S3ServiceException
  ) {
    // ignore any database error: should never be shared with the client.
  } else if (error instanceof Error) {
    message = error.message;
  }

  return res.status(statusCode).json({ message, code: errorCode });
}
