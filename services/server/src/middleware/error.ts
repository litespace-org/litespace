import { ResponseError } from "@litespace/utils/error";
import { AxiosError, isAxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { first } from "lodash";
import { ZodError } from "zod";
import { DatabaseError } from "pg";
import { ApiErrorCode, ApiError, IUser } from "@litespace/types";
import { S3ServiceException } from "@aws-sdk/client-s3";
import { doc } from "@/lib/telegram";
import { createHash } from "node:crypto";

function getZodMessage(error: ZodError) {
  const issue = first(error.errors);
  if (!issue) return error.message;
  return issue.message + ` (${issue.path.join(".")})`;
}

export function errorHandler(
  error: Error | DatabaseError | ResponseError | ZodError | AxiosError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(
    isAxiosError(error)
      ? {
          type: "Axios Error",
          data: error.response?.data,
          status: error.status,
          message: error.message,
        }
      : error
  );

  let statusCode = 400;
  let message = "Unexpected error, please retry";
  let errorCode: ApiErrorCode = ApiError.Unexpected;
  let caption: string | null = null;

  if (error instanceof ResponseError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = error.errorCode;
    caption = `response error: ${message} (${statusCode}/${errorCode})`;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = getZodMessage(error);
    caption = `zod error: ${message}`;
  } else if (error instanceof AxiosError) {
    message = error.response?.data ? error.response.data : error.message;
    statusCode = error.response?.status || 400;
    caption = `axios error: ${JSON.stringify(message)}`;
  } else if (error instanceof DatabaseError) {
    caption = `database error: ${error.message}`;
  } else if (error instanceof S3ServiceException) {
    caption = `s3 error: ${error.message}`;
  } else if (error instanceof Error) {
    message = error.message;
    caption = `unkown api error: ${message}`;
  }

  /**
   * Identifying user using the "hash" of the its ip address.
   *
   * ## Why hash?
   * 1. Privacy: the ip is considered a private/personal user information.
   * 2. Security: if user ip address is leaked, a hacker can perform a DDoS (or
   *    just DoS) on his public ip address.
   *
   * By hasing we are able to identiy the user without knowing his ip address.
   *
   * ## Why `sha1`
   * It is super fast relatively to other hashing alogrithms.
   */
  const ip = first(req.headers["x-real-ip"]) || req.socket.remoteAddress;
  const id = ip ? createHash("sha1").update(ip).digest("hex") : "unkown";

  if (caption)
    doc({
      content: JSON.stringify(
        {
          id,
          stack: error.stack?.split("\n"),
          message: error.message,
          name: error.name,
          req: {
            method: req.method,
            path: req.path,
          },
          user:
            req.user && typeof req.user === "object"
              ? {
                  id: req.user.id,
                  role: IUser.Role[req.user.role],
                }
              : null,
        },
        null,
        2
      ),
      name: "logs.json",
      caption,
    }).catch((error) => {
      console.log(
        `Failed to notify api error`,
        isAxiosError(error) ? error.response : error
      );
    });

  return res.status(statusCode).json({ code: errorCode, message });
}
