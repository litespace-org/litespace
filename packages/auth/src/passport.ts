import { IUser } from "@litespace/types";
import passport from "passport";
import { users, hashPassword } from "@litespace/models";
import { Strategy as Custom, VerifiedCallback } from "passport-custom";
import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { safe } from "@litespace/sol";
import { decodeJwt, encodeJwt } from "@/jwt";
import zod from "zod";

export enum AuthStrategy {
  Password = "password",
  JWT = "jwt",
}

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

const jwtPayload = zod.object({
  id: zod.number().int().positive(),
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

function bearer(secret: string) {
  return async (req: Request, done: VerifiedCallback) => {
    const result = await safe(async () => {
      const header = req.headers["Authorization"];
      if (!header) throw new Error("No authorization header");
      if (typeof header !== "string")
        throw new Error("Invalid authorization header");

      const [bearer, token] = header.split(" ");
      if (bearer !== "Bearer")
        throw new Error("Invalid bearer authorization header");

      const id = decodeJwt(token, secret);
      const user = await users.findById(id);
      if (user === null) throw new Error("User not found");
      return user;
    });

    if (result instanceof Error) return done(result);
    return done(null, result);
  };
}

function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((error) => {
    const status = error ? 400 : 200;
    res.status(status).send();
  });
}

function login(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).send();

    const response: IUser.LoginApiResponse = {
      user: req.user,
      token: encodeJwt(req.user.id, secret),
    };

    res.status(200).json(response);
  };
}

function serializeUser(
  user: IUser.Self,
  done: (error: Error | null, id?: number) => void
) {
  done(null, user.id);
}

async function deserializeUser(id: number, done: VerifiedCallback) {
  const result = await safe(async () => {
    const user = await users.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  });

  if (result instanceof Error) return done(result);
  return done(null, result);
}

export function initPassport({ secret }: { secret: string }) {
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
  passport.use(AuthStrategy.Password, new Custom(password));
  passport.use(AuthStrategy.JWT, new Custom(bearer(secret)));
  const jwt = asyncHandler(passport.authenticate(AuthStrategy.JWT));
  const pass = asyncHandler(passport.authenticate(AuthStrategy.Password));

  // auth routes
  const router = Router();
  router.post("/password", pass, login(secret));
  router.post("/logout", asyncHandler(logout));
  return { router, passport, jwt };
}
