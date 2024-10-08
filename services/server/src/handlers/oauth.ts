import { generateAuthorizationToken } from "@/lib/auth";
import { NextFunction, Request, Response } from "express";

export function oauthHandler(req: Request, res: Response) {
  const token = generateAuthorizationToken(req.user.id);
  res.redirect(`/?token=${token}`);
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout();
  res.status(200).send();
}

export default {
  oauth: oauthHandler,
  logout,
};
