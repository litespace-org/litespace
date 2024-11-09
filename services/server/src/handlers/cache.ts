import { cache } from "@/lib/cache";
import { forbidden } from "@/lib/error";
import { isAdmin } from "@litespace/auth";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";

async function flush(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());
  await cache.flush();
  res.status(200).send();
}

export default {
  flush: safeRequest(flush),
};
