import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";

// @galal @TODO: implement this handler and ensure that its test suite passes.
async function create(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

// @galal @TODO: implement this handler and ensure that its test suite passes.
async function update(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

// @mk @TODO: implement this handler and ensure that its test suite passes.
async function find(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

export default {
  find: safeRequest(find),
  create: safeRequest(create),
  update: safeRequest(update),
};
