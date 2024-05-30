import { generateAuthorizationToken } from "@/lib/auth";
import { Request, Response } from "express";

export function oauthHandler(req: Request, res: Response) {
  const token = generateAuthorizationToken(req.user.id);
  res.redirect(`/?token=${token}`);
}
