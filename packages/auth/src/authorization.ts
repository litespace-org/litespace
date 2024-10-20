import { IUser } from "@litespace/types";
import { NextFunction, Request, Response } from "express";

export function authenticated(req: Request, res: Response, next: NextFunction) {
  if (req.user) return next();
  return res.status(401).send();
}

export class Authorizer {
  private roles: IUser.Role[] = [];
  private ids: number[] = [];
  private isAuthenticated: boolean = false;

  authenticated(): Authorizer {
    this.isAuthenticated = true;
    return this;
  }

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

  admin(): Authorizer {
    return this.superAdmin().regAdmin();
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

    const skipAuth = this.isAuthenticated === false;
    const checkAuth =
      this.isAuthenticated === true && !!user && typeof user === "object";

    return (
      (anyRole && skipOwnership && skipAuth) ||
      allowedRole ||
      checkOwnership ||
      checkAuth
    );
  }
}

export function isUser(user: unknown): user is IUser.Self {
  return !!user && typeof user === "object" && "id" in user;
}

export function isSuperAdmin(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.SuperAdmin;
}

export function isRegAdmin(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.RegularAdmin;
}

export function isAdmin(user: unknown): user is IUser.Self {
  return isRegAdmin(user) || isSuperAdmin(user);
}

export function isTutor(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Tutor;
}

export function isStudent(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Student;
}

export function isMedaiProvider(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.MediaProvider;
}

export function isInterviewer(user: unknown): user is IUser.Self {
  return isUser(user) && user.role === IUser.Role.Interviewer;
}

export function authorizer() {
  return new Authorizer();
}

export function tutor(role: IUser.Role): boolean {
  return role === IUser.Role.Tutor;
}

export function admin(role: IUser.Role): boolean {
  return role === IUser.Role.SuperAdmin || role === IUser.Role.RegularAdmin;
}

export function interviewer(role: IUser.Role): boolean {
  return role === IUser.Role.Interviewer;
}

export function mediaProvider(role: IUser.Role): boolean {
  return role === IUser.Role.MediaProvider;
}

export function student(role: IUser.Role): boolean {
  return role === IUser.Role.Student;
}

export const is = {
  tutor,
  admin,
  interviewer,
  mediaProvider,
  student,
} as const;
