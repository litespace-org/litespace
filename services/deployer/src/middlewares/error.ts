import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import { ZodError } from "zod";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function error(
  error: Error | ZodError,
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
  } else if (error instanceof Error) {
    message = error.message;
  }

  return res.status(statusCode).json({ message });
}
