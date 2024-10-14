import { NextFunction, Request, Response } from "express";
import zod from "zod";
import safeRequest from "express-async-handler";
import { hashPassword, knex, tutors, users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { encodeJwt } from "@/jwt";
import { OAuth2Client } from "google-auth-library";

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

const authGooglePayload = zod.object({
  token: zod.string(),
  role: zod.optional(zod.enum([IUser.Role.Tutor, IUser.Role.Student])),
});

export function password(jwtSecret: string) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = credentials.parse(req.body);
      const hashed = hashPassword(password);
      const user = await users.findByCredentials({ email, password: hashed });
      if (!user) throw new Error("User not found");
      const token = encodeJwt(user.id, jwtSecret);
      const response: IUser.LoginApiResponse = { user, token };
      res.status(200).json(response);
    }
  );
}

export function google({
  clientId,
  jwtSecret,
}: {
  clientId: string;
  jwtSecret: string;
}) {
  const client = new OAuth2Client();
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      // register user in case the `role` filed is provided
      const { token, role } = authGooglePayload.parse(req.body);

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ message: "Invalid google auth token" });
        return;
      }

      const success = (user: IUser.Self) => {
        const response: IUser.LoginApiResponse = {
          user,
          token: encodeJwt(user.id, jwtSecret),
        };
        res.status(200).json(response);
      };

      const user = await users.findByEmail(payload.email);
      if (user && (!role || role === user.role)) return success(user);
      if (user && role && role !== user.role) {
        res
          .status(400)
          .json({ message: `User already registered as ${user.role}` });
        return;
      }
      if (role) {
        const freshUser = await knex.transaction(async (tx) => {
          const user = await users.create({ email: payload.email, role }, tx);
          if (role === IUser.Role.Tutor) await tutors.create(user.id, tx);
          return user;
        });
        return success(freshUser);
      }
      res.status(404).json({ message: "User not found" });
    }
  );
}
