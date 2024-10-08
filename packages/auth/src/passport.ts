import { IUser } from "@litespace/types";
import passport from "passport";
import { users, hashPassword } from "@litespace/models";
import { Strategy as Custom, VerifiedCallback } from "passport-custom";
import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";

export enum AuthStrategy {
  Password = "password",
}

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

async function password(req: Request, done: VerifiedCallback) {
  try {
    const { email, password } = credentials.parse(req.body);
    const user = await users.findByCredentials({
      email,
      password: hashPassword(password),
    });
    if (!user) throw new Error("User not found");
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}

function logout(req: Request, res: Response, next: NextFunction) {
  req.logout();
    res.status(200).send();
}

async function user(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401);
  res.status(200).json(req.user);
}

export function initPassport() {
  passport.serializeUser(
    async (
      user: IUser.Self,
      done: (error: Error | null, id?: number) => void
    ) => done(null, user.id)
  );

  passport.deserializeUser(async (id: number, done: VerifiedCallback) => {
    try {
      const user = await users.findById(id);
      if (!user) throw new Error("User not found");
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });

  passport.use(AuthStrategy.Password, new Custom(password));

  // auth routes
  const router = Router();
  router.post(
    "/password",
    asyncHandler(passport.authenticate(AuthStrategy.Password)),
    user
  );
  router.post("/logout", asyncHandler(logout));
  return { router, passport };
}
