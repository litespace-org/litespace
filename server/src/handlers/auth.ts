import asyncHandler from "express-async-handler";
import { randomBytes, sha256 } from "@/lib/crypto";
import { notfound } from "@/lib/error";
import { tokens, users, knex } from "@litespace/models";
import http from "@/validation/http";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { hashPassword } from "@/lib/user";
import { IToken } from "@litespace/types";
import { isValidToken } from "@/lib/token";
import { DoneCallback } from "passport";

async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = http.auth.forgotPassword.body.parse(req.body);
  const user = await users.findByEmail(email);
  if (!user) return next(notfound.user());

  const token = randomBytes();
  const hash = sha256(token);
  const expiresAt = dayjs.utc().add(10, "minutes").toDate();

  await tokens.create({
    type: IToken.Type.ForgotPassword,
    userId: user.id,
    expiresAt,
    hash,
  });

  await emailer.send({
    to: user.email,
    template: EmailTemplate.ForgetPassword,
    props: { url: `http://localhost:3001/reset-password?token=${token}` },
  });

  res.status(200).send();
}

export async function resetPassword(req: Request, done: DoneCallback) {
  const payload = http.auth.resetPassword.body.parse(req.body);
  const hash = sha256(payload.token);
  const token = await tokens.findByHash(hash);
  if (!isValidToken(token, IToken.Type.ForgotPassword))
    return done(new Error("Invalid token"));

  await knex.transaction(async (tx) => {
    await tokens.makeAsUsed(token.id, tx);
    await users.update(
      token.userId,
      { password: hashPassword(payload.password) },
      tx
    );
  });

  const user = await users.findById(token.userId);
  if (!user) return done(notfound.user());
  return done(null, user);
}

// todo: test this handler. What will happen to "passport" if the hendler throws an error.
export async function verifyEmail(req: Request, done: DoneCallback) {
  const body = http.auth.verifyEmail.body.parse(req.body);
  const hash = sha256(body.token);
  const token = await tokens.findByHash(hash);

  if (!isValidToken(token, IToken.Type.VerifyEmail))
    return done(new Error("Invalid token"));

  await knex.transaction(async (tx) => {
    await tokens.makeAsUsed(token.id, tx);
    await users.update(token.userId, { verified: true }, tx);
  });

  const user = await users.findById(token.userId);
  if (!user) return done(notfound.user());
  return done(null, user);
}

export default {
  forgotPassword: asyncHandler(forgotPassword),
};
