import safeRequest from "express-async-handler";
import {
  bad,
  noPassword,
  notfound,
  serviceUnavailable,
  wrongPassword,
} from "@/lib/error";
import { knex, users } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import { isSamePassword, withImageUrl } from "@/lib/user";
import { IUser } from "@litespace/types";
import { email, password, string } from "@/validation/utils";
import { googleConfig, jwtSecret } from "@/constants";
import { encodeAuthJwt, decodeAuthJwt } from "@litespace/auth";
import { OAuth2Client } from "google-auth-library";
import zod from "zod";
import axios from "axios";

const credentials = zod.object({
  email,
  password,
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

const loginWithAuthTokenPayload = zod.object({ token: string });

async function loginWithPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = credentials.parse(req.body);

  const user = await users.findByEmail(email);
  if (!user) return next(notfound.user());

  const userPassword = await users.findUserPasswordHash(user.id);
  if (!userPassword) return next(noPassword());

  if (!isSamePassword(password, userPassword)) return next(wrongPassword());

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
      email: payload.email.toLowerCase(),
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
  return { email: email.toLowerCase(), verified: !!verified };
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
    // TODO: remove this condition once the turor onboarding is finalized.
    if (role === IUser.Role.Tutor) return next(serviceUnavailable());

    const freshUser = await knex.transaction(async (tx) => {
      const user = await users.create(
        { email: data.email, role, verifiedEmail: data.verified },
        tx
      );
      // TODO: uncomment this once the tutor onboarding is finalized.
      // if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
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

async function refreshAuthToken(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  // TODO: implement refresh-token in the database in order to enable this handler
  next(serviceUnavailable());
}

export default {
  loginWithGoogle: safeRequest(loginWithGoogle),
  loginWithPassword: safeRequest(loginWithPassword),
  loginWithAuthToken: safeRequest(loginWithAuthToken),
  refreshAuthToken: safeRequest(refreshAuthToken),
};
