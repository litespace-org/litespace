import { forbidden } from "@/lib/error";
import s3 from "@/lib/s3";
import { isUser } from "@litespace/utils/user";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";

async function sample(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());
  const url = await s3.get("sample.jpg", 60);
  res.status(200).send(url);
}

export default {
  sample: safeRequest(sample),
};
