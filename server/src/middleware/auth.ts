import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { schema } from "@/validation";
import jwt from "jsonwebtoken";
import { authorizationSecret } from "@/constants";
import { users } from "@/models";
import { IUser } from "@litespace/types";
import { forbidden, userNotFound } from "@/lib/error";
import { isEmpty } from "lodash";
import { DoneCallback } from "passport";
import { decodeAuthorizationToken } from "@/lib/auth";

declare global {
  namespace Express {
    interface Request {
      // todo: enable back
      // user: User.Self;
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

function extractToken(header: string): string {
  const [_, token] = header.split(" ");
  return token.trim() || "";
}

/**
 *
 * @param roles list of user types that is allowed to access the next route.
 *
 * @note empty roles list will make the next route accessable for all user
 * types.
 */
function authHandler(roles?: IUser.Type[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { authorization } = schema.http.auth.header.parse(req.headers);
    const { id } = jwt.verify(
      extractToken(authorization),
      authorizationSecret
    ) as {
      id: number;
    };
    const user = await users.findById(id);
    if (!user) return next(userNotFound);
    if (!isEmpty(roles) && !roles?.includes(user.type)) return next(forbidden);

    req.user = user;
    next();
  };
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return next(forbidden);
}

export async function jwtAuthorization(req: Request, done: DoneCallback) {
  try {
    const token = req.query.token;
    if (!token || typeof token !== "string")
      throw new Error("Missing jwt authorization token");

    const id = decodeAuthorizationToken(token);
    const user = await users.findById(id);

    if (!user) throw new Error("User not found");
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

export function authorizedSocket(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // apply to the first HTTP request of the session.
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) return next();
  return authHandler([])(req, res, next);
}

function auth(roles?: IUser.Type[]) {
  return asyncHandler(authHandler(roles));
}

export const authorized = auth();
export const tutorOnly = auth([IUser.Type.Tutor]);
export const adminOnly = auth([IUser.Type.SuperAdmin, IUser.Type.RegularAdmin]);
export const tutorOrAdmin = auth([
  IUser.Type.Tutor,
  IUser.Type.SuperAdmin,
  IUser.Type.RegularAdmin,
]);
export const studentOrAdmin = auth([
  IUser.Type.Student,
  IUser.Type.SuperAdmin,
  IUser.Type.RegularAdmin,
]);
export const studentOrTutor = auth([IUser.Type.Student, IUser.Type.Tutor]);
export const studentOnly = auth([IUser.Type.Student]);
export default auth;
