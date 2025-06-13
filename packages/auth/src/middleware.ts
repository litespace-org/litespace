import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { decodeAuthJwt } from "@/jwt";
import { users } from "@litespace/models";
import { safe } from "@litespace/utils/error";
import { isAdmin } from "@litespace/utils/user";

export function authMiddleware({ jwtSecret }: { jwtSecret: string }) {
  return safeRequest(
    async (req: Request, _res: Response, next: NextFunction) => {
      const header = req.headers.authorization || req.headers["Authorization"];
      if (!header || typeof header !== "string") return next();

      const [type, token] = header.split(" ");

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
