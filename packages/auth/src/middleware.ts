import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { decodeAuthJwt } from "@/jwt";
import { users } from "@litespace/models";
import { ResponseError, safe } from "@litespace/utils/error";
import { asGhost } from "@litespace/utils/ghost";
import { isAdmin } from "@litespace/utils/user";
import { ApiError } from "@litespace/types";

export function authMiddleware({
  jwtSecret,
  ghostPassword,
}: {
  jwtSecret: string;
  ghostPassword: string;
}) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const header = req.headers.authorization || req.headers["Authorization"];
      if (!header || typeof header !== "string") return next();

      const [type, token] = header.split(" ");

      if (type === "Basic") {
        const data = Buffer.from(token, "base64").toString("utf-8");
        const [username, password] = data.split(":");
        if (password === ghostPassword) req.user = asGhost(username);
      }

      if (type === "Bearer") {
        const id = await safe(async () => decodeAuthJwt(token, jwtSecret));
        if (id instanceof Error) {
          res.status(498).send(
            new ResponseError({
              errorCode: ApiError["TokenExpired"],
              statusCode: 498,
            })
          );
          return;
        }

        const user = await users.findById(id);
        if (user) req.user = user;
      }

      next();
    }
  );
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return res.status(401).send();
  return next();
}
