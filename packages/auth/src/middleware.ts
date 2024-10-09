import { NextFunction, Request, Response } from "express";
import safe from "express-async-handler";
import { decodeJwt } from "@/jwt";
import { users } from "@litespace/models";

export function authMiddleware(secret: string) {
  return safe(async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || req.headers["Authorization"];
    if (!header) return next();

    if (typeof header !== "string")
      throw new Error("Invalid authorization header");

    const [bearer, token] = header.split(" ");
    if (bearer !== "Bearer")
      throw new Error("Invalid bearer authorization header");

    const id = decodeJwt(token, secret);
    const user = await users.findById(id);

    if (user === null) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  });
}
