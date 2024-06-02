import asyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { schema } from "@/validation";
import jwt from "jsonwebtoken";
import { authorizationSecret } from "@/constants";
import { User, users } from "@/models";
import { Forbidden, NotFound } from "@/lib/error";
import { isEmpty } from "lodash";

declare global {
  namespace Express {
    interface Request {
      // todo: enable back
      // user: User.Self;
      _query: { sid: string | undefined };
    }

    interface User extends User.Self {}
  }
}

// used for socket.io
declare module "http" {
  interface IncomingMessage {
    user: User.Self;
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
function authHandler(roles?: User.Type[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { authorization } = schema.http.auth.header.parse(req.headers);
    const { id } = jwt.verify(
      extractToken(authorization),
      authorizationSecret
    ) as {
      id: number;
    };
    const user = await users.findById(id);
    if (!user) return next(new NotFound());
    if (!isEmpty(roles) && !roles?.includes(user.type))
      return next(new Forbidden());

    req.user = user;
    next();
  };
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  console.log({ cookies: req.cookies });
  if (req.isAuthenticated()) return next();
  return next(new Forbidden());
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

function auth(roles?: User.Type[]) {
  return asyncHandler(authHandler(roles));
}

export const authorized = auth();
export const tutorOnly = auth([User.Type.Tutor]);
export const adminOnly = auth([User.Type.SuperAdmin, User.Type.RegularAdmin]);
export const tutorOrAdmin = auth([
  User.Type.Tutor,
  User.Type.SuperAdmin,
  User.Type.RegularAdmin,
]);
export const studentOrAdmin = auth([
  User.Type.Student,
  User.Type.SuperAdmin,
  User.Type.RegularAdmin,
]);
export const studentOrTutor = auth([User.Type.Student, User.Type.Tutor]);
export const studentOnly = auth([User.Type.Student]);
export default auth;
