import { NextFunction, Request, Response } from "express";
import { schema } from "@/validation";
import { users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { forbidden } from "@/lib/error";
import { DoneCallback } from "passport";
import { decodeAuthorizationToken } from "@/lib/auth";
import { hashPassword } from "@/lib/user";
import asyncHandler from "express-async-handler";
import { enforce, Method } from "@/middleware/accessControl";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      _query: { sid: string | undefined };
    }

    interface User extends IUser.Self {}
  }
}

// used for socket.io
declare module "http" {
  interface IncomingMessage {
    user: IUser.Self;
  }
}

export const authorize = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role || "unauthorized";
    const method = req.method as Method;
    const route = req.originalUrl;
    const allowed = enforce({ role, route, method });
    if (!allowed) return next(forbidden());
    return next();
  }
);

export const authorized = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authenticated = req.isAuthenticated();
    if (!authenticated) return next(forbidden());
    return next();
  }
);

export async function jwtAuthorization(req: Request, done: DoneCallback) {
  try {
    const token = req.query.token;
    if (!token || typeof token !== "string")
      throw new Error("Missing jwt authorization token");

    const id = decodeAuthorizationToken(token);
    const user = await users.findById(id);

    if (!user) return done(new Error("User not found"));
    return done(null, user);
  } catch (error) {
    done(error);
  }
}

export async function localAuthorization(req: Request, done: DoneCallback) {
  try {
    const credentials = schema.http.auth.localAuthorization.parse(req.body);
    const user = await users.findByCredentials({
      email: credentials.email,
      password: hashPassword(credentials.password),
    });
    if (!user) return done(new Error("Invalid email or password"));
    return done(null, user);
  } catch (error) {
    done(error);
  }
}
