import { NextFunction, Request, Response } from "express";

export function authenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return res.status(401).send();
}
