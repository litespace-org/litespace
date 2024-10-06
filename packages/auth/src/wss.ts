import { NextFunction, Request, RequestHandler, Response } from "express";

export function onlyForHandshake(middleware: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

export function authorizeSocket(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ("user" in req) return next();
  res.writeHead(401);
  res.end();
}
