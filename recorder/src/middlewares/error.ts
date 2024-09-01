import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import { ZodError } from "zod";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function error(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 400;
  let message = "Unexpected error, please retry";

  if (error instanceof ZodError) {
    message = getZodMessage(error);
    statusCode = 400;
  } else if (error instanceof Error) message = error.message;

  res.status(statusCode).json({ message });
}
