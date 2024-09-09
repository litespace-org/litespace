import { IUser } from "@litespace/types";
import { NextFunction, Request, Response } from "express";

export function authenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return res.status(401).send();
}

export class Authorizer {
  private roles: IUser.Role[] = [];
  private ids: number[] = [];

  role(role: IUser.Role): Authorizer {
    if (this.roles.includes(role)) return this;
    this.roles.push(role);
    return this;
  }

  superAdmin(): Authorizer {
    return this.role(IUser.Role.SuperAdmin);
  }

  regAdmin(): Authorizer {
    return this.role(IUser.Role.RegularAdmin);
  }

  interviewer(): Authorizer {
    return this.role(IUser.Role.Interviewer);
  }

  mediaProvider(): Authorizer {
    return this.role(IUser.Role.MediaProvider);
  }

  tutor(): Authorizer {
    return this.role(IUser.Role.Tutor);
  }

  student(): Authorizer {
    return this.role(IUser.Role.Student);
  }

  owner(id: number): Authorizer {
    if (this.ids.includes(id)) return this;
    this.ids.push(id);
    return this;
  }

  member(...ids: number[]): Authorizer {
    this.ids.push(...ids);
    return this;
  }

  check(user?: unknown): user is IUser.Self {
    // check user roles
    const anyRole = this.roles.length === 0;
    const allowedRole =
      !!user &&
      typeof user === "object" &&
      "role" in user &&
      this.roles.includes(user.role as IUser.Role);
    // check ownership
    const skipOwnership = this.ids.length === 0;
    const checkOwnership =
      !!user &&
      typeof user === "object" &&
      "id" in user &&
      typeof user.id === "number" &&
      this.ids.includes(user.id);

    return (anyRole && skipOwnership) || allowedRole || checkOwnership;
  }
}

export function authorizer() {
  return new Authorizer();
}
