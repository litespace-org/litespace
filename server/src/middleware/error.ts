import { isProduction } from "@/constants";
import ResponseError, { ErrorCode } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { AxiosError } from "axios";
import { NextFunction } from "express";
import { first } from "lodash";
import { ZodError } from "zod";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function errorHandler(
  error: Error | ResponseError | ZodError | AxiosError,
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  if (!isProduction) console.error(error);

  let statusCode = 400;
  let message = "Unexpected error, please retry";
  let errorCode = ErrorCode.Unexpected;

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
