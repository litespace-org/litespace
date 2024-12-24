import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { decodeAuthJwt } from "@/jwt";
import { users } from "@litespace/models";
import { safe } from "@litespace/sol/error";
import { asGhost } from "@litespace/sol/ghost";
import { isAdmin } from "@/authorization";

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
