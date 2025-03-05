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
import { hashPassword, withImageUrl } from "@/lib/user";
import { IToken, IUser } from "@litespace/types";
import { email, id, password, string, url } from "@/validation/utils";
import { googleConfig, jwtSecret } from "@/constants";
import { encodeAuthJwt, decodeAuthJwt, isUser } from "@litespace/auth";
import { OAuth2Client } from "google-auth-library";
import zod from "zod";
import jwt from "jsonwebtoken";
import { sendBackgroundMessage } from "@/workers";
import { WorkerMessageType } from "@/workers/messages";
import axios from "axios";

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

const authGooglePayload = zod.object({
  token: zod.string(),
  type: zod.union([zod.literal("bearer"), zod.literal("id-token")]),
  role: zod.optional(
    zod.union([zod.literal(IUser.Role.Tutor), zod.literal(IUser.Role.Student)])
  ),
});

const googleUserInfo = zod.object({
  email: zod.string().email(),
  email_verified: zod.boolean().optional(),
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
  type: zod.literal(IToken.Type.ForgetPassword),
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
  const user = await users.findByCredentials({ email, password: hashed });
  if (!user) return next(notfound.user());
  const token = encodeAuthJwt(user.id, jwtSecret);
  const response: IUser.LoginApiResponse = {
    user: await withImageUrl(user),
    token,
  };
  res.status(200).json(response);
}

async function getGoogleEmail({
  token,
  type,
}: {
  token: string;
  type: "bearer" | "id-token";
}): Promise<{ email: string; verified: boolean } | null> {
  const client = new OAuth2Client();
  if (type === "id-token") {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleConfig.clientId,
    });

    const payload = googleUserInfo.parse(ticket.getPayload());
    return {
      email: payload.email,
      verified: !!payload.email_verified,
    };
  }

  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      params: {
        access_token: token,
      },
    }
  );

  const { email, email_verified: verified } = googleUserInfo.parse(data);
  return { email, verified: !!verified };
}

// https://stackoverflow.com/questions/16501895/how-do-i-get-user-profile-using-google-access-token
async function loginWithGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // register user in case the `role` field is provided
  const { token, type, role } = authGooglePayload.parse(req.body);

  const data = await getGoogleEmail({ token, type });
  if (!data) return next(bad());

  const success = async (user: IUser.Self) => {
    const token = encodeAuthJwt(user.id, jwtSecret);
    const response: IUser.LoginApiResponse = {
      user: await withImageUrl(user),
      token,
    };
    res.status(200).json(response);
  };

  const user = await users.findByEmail(data.email);
  if (user && role && role !== user.role) return next(bad());
  if (user && (!role || role === user.role)) return await success(user);

  if (role) {
    const freshUser = await knex.transaction(async (tx) => {
      const user = await users.create(
        { email: data.email, role, verified: data.verified },
        tx
      );
      if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
      return user;
    });
    return await success(freshUser);
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
    user: await withImageUrl(user),
    token: encodeAuthJwt(id, jwtSecret),
  };

  res.status(200).json(response);
}

async function forgetPassword(req: Request, res: Response) {
  const { email, callbackUrl }: IUser.ForgetPasswordApiPayload =
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
  if (type !== IToken.Type.ForgetPassword) return next(bad());

  const user = await users.findById(id);
  if (!user) return next(notfound.user());

  const updated = await users.update(id, {
    password: hashPassword(password),
  });

  const response: IUser.ResetPasswordApiResponse = {
    user: await withImageUrl(updated),
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
  forgetPassword: safeRequest(forgetPassword),
  resetPassword: safeRequest(resetPassword),
  verifyEmail: safeRequest(verifyEmail),
  sendVerificationEmail: safeRequest(sendVerificationEmail),
};
