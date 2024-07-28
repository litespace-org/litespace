import { subscriptions } from "@/models";
import { IUser } from "@litespace/types";
import {
  alreadySubscribed,
  badRequest,
  forbidden,
  subscriptionNotFound,
} from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import dayjs from "@/lib/dayjs";
import { asDayStart } from "@/lib/slots";
import { calculateSubscriptionEndDate } from "@/lib/subscriptions";
import { isEmpty } from "lodash";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const { monthlyMinutes, period, autoRenewal } =
    schema.http.subscription.create.body.parse(req.body);

  if (req.user.role !== IUser.Role.Student) return next(forbidden());

  const subscription = await subscriptions.findByStudentId(req.user.id);
  if (subscription) return next(alreadySubscribed());

  const start = asDayStart(dayjs().utc());
  const end = calculateSubscriptionEndDate(start, period);

  const id = await subscriptions.create({
    studentId: req.user.id,
    monthlyMinutes,
    remainingMinutes: monthlyMinutes,
    start: start.toISOString(),
    end: end.toISOString(),
    autoRenewal,
  });

  res.status(200).json({ id });
}

async function update(req: Request.Default, res: Response, next: NextFunction) {
  const studentId = req.user.id;
  const { period, autoRenewal } = schema.http.subscription.update.body.parse(
    req.body
  );

  if (isEmpty(req.body)) return next(badRequest);

  const subscription = await subscriptions.findByStudentId(studentId);
  if (!subscription) return next(subscriptionNotFound);

  const owner = studentId === subscription.studentId;
  if (!owner) return next(forbidden);

  const today = asDayStart(dayjs().utc());
  const end = period
    ? calculateSubscriptionEndDate(today, period).toISOString()
    : undefined;

  await subscriptions.update({
    id: subscription.id,
    autoRenewal,
    end,
  });

  res.status(204).send();
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const studentId = req.user.id;

  const subscription = await subscriptions.findByStudentId(studentId);
  if (!subscription) return next(subscriptionNotFound);

  const owner = subscription.studentId === studentId;
  if (!owner) return next(forbidden);

  await subscriptions.delete(subscription.id);
  res.status(204).send();
}

async function getStudentSubscription(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  if (req.user.role !== IUser.Role.Student) return next(forbidden);

  const subscription = await subscriptions.findByStudentId(req.user.id);
  if (!subscription) return next(subscriptionNotFound);

  const owner = req.user.id === subscription.studentId;
  if (!owner) return next(forbidden);

  res.status(200).json(subscription);
}

async function getList(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const list = await subscriptions.findAll();
  res.status(200).json(list);
}

export default {
  create: asyncHandler(create),
  update: asyncHandler(update),
  delete: asyncHandler(delete_),
  getStudentSubscription: asyncHandler(getStudentSubscription),
  getList: asyncHandler(getList),
};
