import { Request, Response } from "@/types/http";
import asyncHandler from "express-async-handler";
import { NextFunction } from "express";
import { schema } from "@/validation";
import jwt from "jsonwebtoken";
import { authorizationSecret } from "@/constants";
import { User, users } from "@/database";
import { Forbidden, NotFound } from "@/lib/error";
import { isEmpty } from "lodash";

declare global {
  namespace Express {
    interface Request {
      user: User.Self;
    }
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
  return async (req: Request.Default, _res: Response, next: NextFunction) => {
    const { authorization } = schema.http.auth.header.parse(req.headers);
    const { id } = jwt.verify(
      extractToken(authorization),
      authorizationSecret
    ) as {
      id: number;
    };
    const user = await users.findOne(id);
    if (!user) return next(new NotFound());
    if (!isEmpty(roles) && !roles?.includes(user.type))
      return next(new Forbidden());

    req.user = user;
    next();
  };
}

function auth(roles?: User.Type[]) {
  return asyncHandler(authHandler(roles));
}

export default auth;
