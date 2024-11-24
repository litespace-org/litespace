import safeRequest from "express-async-handler";
import {
  already,
  bad,
  emailAlreadyVerified,
  forbidden,
  notfound,
} from "@/lib/error";
import { knex, tutors, users } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import { hashPassword } from "@/lib/user";
import { IToken, IUser } from "@litespace/types";
import { email, id, password, string, url } from "@/validation/utils";
import { googleConfig, jwtSecret } from "@/constants";
import { encodeAuthJwt, decodeAuthJwt, isUser } from "@litespace/auth";
import { OAuth2Client } from "google-auth-library";
import zod from "zod";
import jwt from "jsonwebtoken";
import { sendBackgroundMessage } from "@/workers";
import { WorkerMessageType } from "@/workers/messages";

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

const authGooglePayload = zod.object({
  token: zod.string(),
  role: zod.optional(zod.enum([IUser.Role.Tutor, IUser.Role.Student])),
});

const forgotPasswordPayload = zod.object({ email, callbackUrl: url });
const loginWithAuthTokenPayload = zod.object({ token: string });
const resetPasswordPayload = zod.object({ token: string, password });
const verifyEmailPayload = zod.object({ token: string });
const verifyEmailJwtPayload = zod.object({
  type: zod.literal(IToken.Type.VerifyEmail),
  user: id,
});

const foregetPasswordJwtPayload = zod.object({
  type: zod.literal(IToken.Type.ForgotPassword),
  user: id,
});

const sendVerificationEmailPayload = zod.object({ callbackUrl: url });

async function loginWithPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //! note: here you can catch if the user owns multiple accounts.
  const { email, password } = credentials.parse(req.body);
  const hashed = hashPassword(password);
  const allUsers = await users.find({});
  console.log(allUsers);
  const user = await users.findByCredentials({ email, password: hashed });
  if (!user) return next(notfound.user());
  const token = encodeAuthJwt(user.id, jwtSecret);
  const response: IUser.LoginApiResponse = { user, token };
  res.status(200).json(response);
}

async function loginWithGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const client = new OAuth2Client();
  // register user in case the `role` field is provided
  const { token, role } = authGooglePayload.parse(req.body);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: googleConfig.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) return next(bad());

  const success = (user: IUser.Self) => {
    const token = encodeAuthJwt(user.id, jwtSecret);
    const response: IUser.LoginApiResponse = { user, token };
    res.status(200).json(response);
  };

  const user = await users.findByEmail(payload.email);
  if (user && (!role || role === user.role)) return success(user);
  if (user && role && role !== user.role) return next(bad());

  if (role) {
    const freshUser = await knex.transaction(async (tx) => {
      const user = await users.create({ email: payload.email, role }, tx);
      if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
      return user;
    });
    return success(freshUser);
  }

  return next(notfound.user());
}

async function loginWithAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token } = loginWithAuthTokenPayload.parse(req.body);
  const id = decodeAuthJwt(token, jwtSecret);
  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  const response: IUser.LoginWithAuthTokenApiResponse = {
    user,
    token: encodeAuthJwt(id, jwtSecret),
  };

  res.status(200).json(response);
}

async function forgotPassword(req: Request, res: Response) {
  const { email, callbackUrl }: IUser.ForegetPasswordApiPayload =
    forgotPasswordPayload.parse(req.body);
  const user = await users.findByEmail(email);

  if (user) {
    sendBackgroundMessage({
      type: WorkerMessageType.SendForgetPasswordEmail,
      email: user.email,
      user: user.id,
      callbackUrl,
    });
  }

  res.status(200).send();
}

async function resetPassword(req: Request, res: Response, next: NextFunction) {
  const { password, token } = resetPasswordPayload.parse(req.body);
  const jwtPayload = jwt.verify(token, jwtSecret);
  const { type, user: id } = foregetPasswordJwtPayload.parse(jwtPayload);
  if (type !== IToken.Type.ForgotPassword) return next(bad());

  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  const updated = await users.update(id, {
    password: hashPassword(password),
  });

  const response: IUser.ResetPasswordApiResponse = {
    user: updated,
    token: encodeAuthJwt(id, jwtSecret),
  };

  res.status(200).json(response);
}

async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  const { token } = verifyEmailPayload.parse(req.body);
  const jwtPayload = jwt.verify(token, jwtSecret);

  const { type, user: id }: IToken.VerifyEmailJwtPayload =
    verifyEmailJwtPayload.parse(jwtPayload);
  if (type !== IToken.Type.VerifyEmail) return next(bad());

  const user = await users.findById(id);
  if (!user) return next(notfound.user());
  if (user.verified) return next(emailAlreadyVerified());

  await users.update(id, { verified: true });
  res.status(200).send();
}

async function sendVerificationEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { callbackUrl } = sendVerificationEmailPayload.parse(req.body);

  if (user.verified) return next(already.verified());

  sendBackgroundMessage({
    type: WorkerMessageType.SendUserVerificationEmail,
    callbackUrl: callbackUrl,
    email: user.email,
    user: user.id,
  });

  res.status(200).send();
}

export default {
  loginWithGoogle: safeRequest(loginWithGoogle),
  loginWithPassword: safeRequest(loginWithPassword),
  loginWithAuthToken: safeRequest(loginWithAuthToken),
  forgotPassword: safeRequest(forgotPassword),
  resetPassword: safeRequest(resetPassword),
  verifyEmail: safeRequest(verifyEmail),
  sendVerificationEmail: safeRequest(sendVerificationEmail),
};
