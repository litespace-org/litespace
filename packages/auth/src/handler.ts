import { NextFunction, Request, Response } from "express";
import zod from "zod";
import safeRequest from "express-async-handler";
import { hashPassword, users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { encodeJwt } from "@/jwt";

const credentials = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export function password(secret: string) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = credentials.parse(req.body);
      const hashed = hashPassword(password);
      const user = await users.findByCredentials({ email, password: hashed });
      if (!user) throw new Error("User not found");
      const token = encodeJwt(user.id, secret);
      const response: IUser.LoginApiResponse = { user, token };
      res.status(200).json(response);
    }
  );
}
