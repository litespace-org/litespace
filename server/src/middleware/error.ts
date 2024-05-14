import { isProduction } from "@/constants";
import ResponseError from "@/lib/error";
import { Request, Response } from "@/types/http";
import { NextFunction } from "express";

export function errorHandler(
  error: Error | ResponseError,
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  if (!isProduction) console.error(error);

  let statusCode = 400;
  let message = "Unexpected error, please retry";

  if (error instanceof ResponseError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return res.status(statusCode).json({ error: message });
}
