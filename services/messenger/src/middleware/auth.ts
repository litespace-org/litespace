import { config } from "@/lib/config";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";

async function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || req.headers["Authorization"];
  if (!header || typeof header !== "string") {
    res.sendStatus(401);
    return;
  }

  const [type, token] = header.split(" ");

  if (type !== "Basic" || !token) {
    res.sendStatus(401);
    return;
  }

  const data = Buffer.from(token, "base64").toString("utf-8");
  const [username, password] = data.split(":");
  if (
    username !== config.credentials.username ||
    password !== config.credentials.password
  ) {
    res.sendStatus(401);
    return;
  }

  return next();
}

export default safeRequest(auth);
