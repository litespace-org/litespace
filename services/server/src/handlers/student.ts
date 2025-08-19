import { NextFunction, Request, Response } from "express";

function create(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

function update(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

export default {
  create,
  update,
};
