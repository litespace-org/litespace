import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";

export function auth(config: { username: string; password: string }) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const header = req.headers.authorization || req.headers["Authorization"];
      if (!header || typeof header !== "string") {
        res.sendStatus(400);
        return;
      }

      const [type, token] = header.split(" ");
      if (type !== "Basic") {
        res.sendStatus(400);
        return;
      }

      const data = Buffer.from(token, "base64").toString("utf-8");
      const [username, password] = data.split(":");
      if (username !== config.username || password !== config.password) {
        res.sendStatus(401);
        return;
      }

      next();
    }
  );
}
