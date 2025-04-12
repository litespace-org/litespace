import { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import { ZodError } from "zod";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function errorHandler(
  error: Error | ZodError | AxiosError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  let statusCode = 400;
  let message = "Unexpected error, please retry";

  if (error instanceof ZodError) {
    statusCode = 400;
    message = getZodMessage(error);
  } else if (error instanceof AxiosError) {
    message = error.response?.data ? error.response.data : error.message;
    statusCode = error.response?.status || 400;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return res.status(statusCode).json({ type: "error", value: message });
}
