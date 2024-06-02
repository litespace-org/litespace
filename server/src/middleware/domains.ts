import { NextFunction, Request, Response } from "express";

export function allowCrossDomains(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if ("OPTIONS" == req.method) return res.send(200);
  return next();
}
