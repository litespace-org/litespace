import { serverConfig } from "@/constants";
import { generateAuthorizationToken } from "@/lib/auth";
import { NextFunction, Request, Response } from "express";

export function oauthHandler(req: Request, res: Response) {
  const token = generateAuthorizationToken(req.user.id);
  res.redirect(`/?token=${token}`);
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((error) => {
    if (error) return next(error);
    res.redirect(serverConfig.client);
  });
}

export default {
  oauth: oauthHandler,
  logout,
};
