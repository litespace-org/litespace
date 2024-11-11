import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { decodeAuthJwt } from "@/jwt";
import { users } from "@litespace/models";
import { safe } from "@litespace/sol/error";
import { isAdmin } from "@/authorization";
import { IUser } from "@litespace/types";

export function authMiddleware({
  jwtSecret,
  ghostToken,
}: {
  jwtSecret: string;
  ghostToken: string;
}) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const header = req.headers.authorization || req.headers["Authorization"];
      if (!header || typeof header !== "string") return next();

      const [type, token] = header.split(" ");

      if (type === "Basic" && token.trim() === ghostToken)
        req.user = IUser.GHOST;

      if (type === "Bearer") {
        const id = await safe(async () => decodeAuthJwt(token, jwtSecret));
        if (id instanceof Error) return next();

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
