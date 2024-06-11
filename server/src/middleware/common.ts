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
