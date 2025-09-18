import zod, { ZodSchema } from "zod";
import { IPlan, ISubscription } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import {
  bad,
  fawryError,
  forbidden,
  notfound,
  subscriptionUncancellable,
} from "@/lib/error";
import {
  id,
  pageNumber,
  pageSize,
  withNamedId,
  string,
} from "@/validation/utils";
import { isAdmin, isStudent, isSuperAdmin } from "@litespace/utils/user";
import { lessons, subscriptions, transactions } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { first, max, sum } from "lodash";
import {
  calcRemainingWeeklyMinutesBySubscription,
  generateFreeSubscription,
} from "@/lib/subscription";
import { price, safe } from "@litespace/utils";
import { fawry } from "@/fawry/api";
import { fawryConfig } from "@/constants";
import { genSignature } from "@/fawry/lib";

const findQuery: ZodSchema<ISubscription.FindApiQuery> = zod.object({
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

const findUserSubscriptionQuery: ZodSchema<ISubscription.FindUserSubscriptionApiQuery> =
  zod.object({
    userId: id,
  });

const cancelPayload = zod.object({ id: id.optional() });

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isAdmin(user) || isStudent(user);
  if (!allowed) return next(forbidden());

  const query: ISubscription.FindApiQuery = findQuery.parse(req.query);

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

async function findUserSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { userId }: ISubscription.FindUserSubscriptionApiQuery =
    findUserSubscriptionQuery.parse(req.query);
  if (isStudent(user) && user.id !== userId) return next(forbidden());

  const now = dayjs.utc();
  const { list } = await subscriptions.find({
    users: [userId],
    terminated: false,
    end: { after: now.toISOString() },
  });

  const subscription =
    first(list) ||
    generateFreeSubscription({
      userId: user.id,
      userCreatedAt: user.createdAt,
    });

  const remainingWeeklyMinutes =
    await calcRemainingWeeklyMinutesBySubscription(subscription);

  const response: ISubscription.FindUserSubscriptionApiResponse = {
    info: subscription || null,
    remainingWeeklyMinutes,
  };

  res.status(200).json(response);
}

async function cancel(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isSuperAdmin(user);
  if (!allowed) return next(forbidden());

  const { id: subId } = cancelPayload.parse(req.body);

  // Only admins must use the id in the payload
  if (subId && isStudent(user)) return next(bad());
  if (!subId && isSuperAdmin(user)) return next(bad());

  // @NOTE: the id is optional in the payload
  let sub = subId ? await subscriptions.findById(subId) : undefined;

  const now = dayjs().toISOString();

  if (!sub && isStudent(user)) {
    const { list } = await subscriptions.find({
      users: [user.id],
      terminated: false,
      end: { after: now },
    });
    sub = first(list);
  }

  if (!sub) return next(notfound.subscription());

  // In case the subscription id is provider in the payload, the sub can be already terminated
  if (sub.terminatedAt) {
    res.sendStatus(200);
    return;
  }

  // In case it's not terminated yet; refund money and only then terminate the subscription
  // 1) Evaluate the refund money amount
  const { list: attendedLessons } = await lessons.find({
    users: [sub.userId],
    canceled: false,
    before: now,
  });
  const totalLessonsPrice = sum(attendedLessons.map((l) => l.price));

  const transaction = await transactions.findById(sub.txId);
  if (!transaction) return next(notfound.transaction());
  const payedMoney = transaction.amount;

  const refundAmountScaled = max([payedMoney - totalLessonsPrice, 0]) || 0;

  if (refundAmountScaled === 0) {
    return next(subscriptionUncancellable());
  }

  // 2) Refund the money
  // @TODO: disable refunding after a certain number of days of the subscription; discuss it with the team
  if (!transaction.providerRefNum) return next(bad("providerRefNum not found"));

  const fawryRes = await safe(() =>
    fawry.refund({
      merchantCode: fawryConfig.merchantCode,
      referenceNumber: transaction.providerRefNum!.toString(),
      refundAmount: price.unscale(refundAmountScaled),
      reason: "",
      signature: genSignature.forRefundRequest({
        referenceNumber: transaction.providerRefNum!.toString(),
        refundAmount: price.unscale(refundAmountScaled),
        reason: "",
      }),
    })
  );

  if (fawryRes instanceof Error) return next(fawryError());

  // 3) Terminate the subscription
  await subscriptions.update(sub.id, {
    terminatedAt: dayjs().toISOString(),
    terminatedBy: user.id,
  });

  const response: ISubscription.CancelApiResponse = {
    refundAmount: refundAmountScaled,
  };

  res.status(200).json(response);
}

export default {
  find: safeRequest(find),
  findById: safeRequest(findById),
  findUserSubscription: safeRequest(findUserSubscription),
  cancel: safeRequest(cancel),
};
