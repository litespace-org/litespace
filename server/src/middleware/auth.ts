import { NextFunction, Request, Response } from "express";
import { schema } from "@/validation";
import { users } from "@/models";
import { IUser } from "@litespace/types";
import { forbidden, notfound } from "@/lib/error";
import { isEmpty } from "lodash";
import { DoneCallback } from "passport";
import { decodeAuthorizationToken } from "@/lib/auth";
import { hashPassword } from "@/lib/user";
import asyncHandler from "express-async-handler";
import { identityObject } from "@/validation/utils";

declare global {
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

type OwnerHandler = (req: Request) => Promise<number>;

/**
 * @param roles list of user types that is allowed to access the next route.
 *
 * @note Empty roles list will make the next route accessable for all user
 * types.
 */
function authHandler(roles: IUser.Type[], getOwnerId?: OwnerHandler) {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      const authorized = req.isAuthenticated();
      const userId = req.user?.id;
      const userType = req.user?.type;
      const ownerId = getOwnerId ? await getOwnerId(req) : userId;
      const isOwner = userId === ownerId;

      const allowAnyRole = isEmpty(roles);
      const roleAllowed = roles.includes(userType);
      const eligible = allowAnyRole || roleAllowed || isOwner;
      if (!authorized || !eligible) return next(forbidden());
      return next();
    }
  );
}

class Authorizer {
  private roles: IUser.Type[] = [];
  private ownerHandler?: OwnerHandler;

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

  interviwer(): Authorizer {
    this.roles.push(IUser.Type.Interviewer);
    return this;
  }

  staff(): Authorizer {
    return this.superAdmin().regAdmin().interviwer();
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

  owner(handler: OwnerHandler): Authorizer {
    this.ownerHandler = handler;
    return this;
  }

  simpleOwner<
    M extends object,
    T extends { findById(id: number): Promise<M | null> },
  >(model: T, selector: (record: M) => number): Authorizer {
    async function handler(req: Request): Promise<number> {
      const { id } = identityObject.parse(req.params);
      const record = await model.findById(id);
      if (!record) throw notfound();
      return selector(record);
    }
    this.ownerHandler = handler;
    return this;
  }

  handler() {
    return authHandler(this.roles, this.ownerHandler);
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
  const token = req.query.token;
  if (!token || typeof token !== "string")
    throw new Error("Missing jwt authorization token");

  const id = decodeAuthorizationToken(token);
  const user = await users.findById(id);

  if (!user) return done(new Error("User not found"));
  return done(null, user);
}

export async function localAuthorization(req: Request, done: DoneCallback) {
  const credentials = schema.http.auth.localAuthorization.parse(req.body);
  const user = await users.findByCredentials(
    credentials.email,
    hashPassword(credentials.password)
  );
  if (!user) return done(new Error("Invalid email or password"));
  return done(null, user);
}
