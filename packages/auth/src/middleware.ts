import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { decodeAuthJwt } from "@/jwt";
import { users } from "@litespace/models";
import { safe } from "@litespace/sol/error";

export function authMiddleware(secret: string) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const header = req.headers.authorization || req.headers["Authorization"];
      if (!header) return next();

      if (typeof header !== "string")
        throw new Error("Invalid authorization header");

      const [bearer, token] = header.split(" ");
      if (bearer !== "Bearer")
        throw new Error("Invalid bearer authorization header");

      const id = await safe(async () => decodeAuthJwt(token, secret));
      // skip in case of invalid token
      if (id instanceof Error) return next();
      const user = await users.findById(id);

      if (user === null) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      req.user = user;
      next();
    }
  );
}
