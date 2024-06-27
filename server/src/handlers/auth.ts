import asyncHandler from "express-async-handler";
import { randomBytes, sha256 } from "@/lib/crypto";
import { notfound } from "@/lib/error";
import { tokens, users } from "@/models";
import http from "@/validation/http";
import dayjs from "@/lib/dayjs";
import { NextFunction, Request, Response } from "express";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { hashPassword } from "@/lib/user";
import { IToken } from "@litespace/types";
import { isValidToken } from "@/lib/token";

async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = http.auth.forgotPassword.body.parse(req.body);
  const user = await users.findByEmail(email);
  if (!user) return next(notfound());

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

async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const payload = http.auth.resetPassword.body.parse(req.body);
  const hash = sha256(payload.token);
  const token = await tokens.findByHash(hash);
  if (!isValidToken(token, IToken.Type.ForgotPassword))
    return next(new Error("Invalid token"));

  // todo: use transaction query
  await tokens.makeAsUsed(token.id);

  await users.update(token.userId, {
    password: hashPassword(payload.password),
  });

  res.status(200).send();
}

async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  const body = http.auth.verifyEmail.body.parse(req.body);
  const hash = sha256(body.token);
  const token = await tokens.findByHash(hash);

  if (!isValidToken(token, IToken.Type.VerifyEmail))
    return next(new Error("Invalid token"));

  await tokens.makeAsUsed(token.id);
  await users.update(token.userId, { verified: true });
  res.status(200).send();
}

export default {
  forgotPassword: asyncHandler(forgotPassword),
  resetPassword: asyncHandler(resetPassword),
  verifyEmail: asyncHandler(verifyEmail),
};
