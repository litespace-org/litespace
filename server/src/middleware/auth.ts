import { NextFunction, Request, Response } from "express";
import { schema } from "@/validation";
import { users } from "@/models";
import { IUser } from "@litespace/types";
import { forbidden } from "@/lib/error";
import { isEmpty } from "lodash";
import { DoneCallback } from "passport";
import { decodeAuthorizationToken } from "@/lib/auth";
import { hashPassword } from "@/lib/user";

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
 * @note Empty roles list will make the next route accessable for all user
 * types.
 */
function authHandler(roles: IUser.Type[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authorized = req.isAuthenticated();
    const allowAnyRole = isEmpty(roles);
    const roleAllowed = roles.includes(req.user.type);
    const validRole = allowAnyRole || roleAllowed;
    if (!authorized || !validRole) return next(forbidden());
    return next();
  };
}

class Authorizer {
  private roles: IUser.Type[] = [];

  superAdmin(): Authorizer {
    this.roles.push(IUser.Type.SuperAdmin);
    return this;
  }

  regAdmin(): Authorizer {
    this.roles.push(IUser.Type.RegularAdmin);
    return this;
  }

  admins(): Authorizer {
    return this.superAdmin().regAdmin();
  }

  examiner(): Authorizer {
    this.roles.push(IUser.Type.Examiner);
    return this;
  }

  staff(): Authorizer {
    return this.superAdmin().regAdmin().examiner();
  }

  tutor(): Authorizer {
    this.roles.push(IUser.Type.Tutor);
    return this;
  }

  student(): Authorizer {
    this.roles.push(IUser.Type.Student);
    return this;
  }

  nonstaff(): Authorizer {
    return this.tutor().student();
  }

  handler() {
    return authHandler(this.roles);
  }
}

export function authorizer() {
  return new Authorizer();
}

export const student = authorizer().student().handler();
export const tutor = authorizer().tutor().handler();
export const admins = authorizer().admins().handler();
export const superAdmin = authorizer().superAdmin().handler();
export const staff = authorizer().staff().handler();
export const authorized = authorizer().handler();

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

export async function localAuthorization(req: Request, done: DoneCallback) {
  try {
    const credentials = schema.http.auth.localAuthorization.parse(req.body);
    const user = await users.findByCredentials(
      credentials.email,
      hashPassword(credentials.password)
    );
    if (!user) return done(new Error("Invalid email or password"));
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}
