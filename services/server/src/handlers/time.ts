import { forbidden } from "@/lib/error";
import { isUser } from "@litespace/utils/user";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import dayjs from "@/lib/dayjs";
import zod from "zod";

const currentHourQuery = zod.object({
  timezone: zod.string(),
});

async function currentHour(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { timezone: tz } = currentHourQuery.parse(req.query);

  // Get current time in the specified timezone
  const currentTime = dayjs().tz(tz);
  const hour = currentTime.hour();

  res.status(200).json({ hour });
}

export default {
  currentHour: safeRequest(currentHour),
};
