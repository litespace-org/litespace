import zod from "zod";
import { IPlan, ISubscription } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { forbidden, notfound } from "@/lib/error";
import {
  id,
  pageNumber,
  pageSize,
  withNamedId,
  string,
} from "@/validation/utils";
import { isAdmin, isStudent } from "@litespace/utils/user";
import { subscriptions } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { first } from "lodash";
import { calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription } from "@/lib/subscription";

const findQuery = zod.object({
  ids: id.array().optional(),
  users: id.array().optional(),
  plans: id.array().optional(),
  periods: zod.nativeEnum(IPlan.Period).array().optional(),
  weeklyMinutes: zod
    .union([
      zod.coerce.number().min(0).optional(),
      zod.object({
        gte: zod.number().optional(),
        lte: zod.coerce.number().optional(),
        gt: zod.coerce.number().optional(),
        lt: zod.coerce.number().optional(),
      }),
    ])
    .optional(),
  start: zod
    .object({
      after: string.optional(),
      before: string.optional(),
    })
    .optional(),
  end: zod
    .object({
      after: string.optional(),
      before: string.optional(),
    })
    .optional(),
  page: pageNumber.optional().default(1),
  size: pageSize.optional().default(10),
});

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user);
  if (!allowed) return next(forbidden());

  const query: ISubscription.FindQueryApi = findQuery.parse(req.query);

  const response: ISubscription.FindApiResponse = await subscriptions.find({
    ...query,
    users: isStudent(user) ? [user.id] : query.users,
  });

  res.status(200).json(response);
}

async function findById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const subscription = await subscriptions.findById(id);
  if (!subscription) return next(notfound.subscription());

  if (isStudent(user) && user.id != subscription.userId)
    return next(forbidden());

  const response: ISubscription.FindByIdApiResponse = subscription;
  res.status(200).json(response);
}

async function findCurrent(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const now = dayjs.utc();
  const { list } = await subscriptions.find({
    users: [user.id],
    terminated: false,
    end: { after: now.toISOString() },
  });

  const subscription = first(list);

  const remainingWeeklyMinutes = subscription
    ? await calculateRemainingWeeklyMinutesOfCurrentWeekBySubscription({
        start: subscription.start,
        userId: subscription.userId,
        weeklyMinutes: subscription.weeklyMinutes,
      })
    : 0;

  const response: ISubscription.FindCurrentApiResponse = {
    info: subscription || null,
    remainingWeeklyMinutes,
  };

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  findById: safeRequest(findById),
  findCurrent: safeRequest(findCurrent),
};
