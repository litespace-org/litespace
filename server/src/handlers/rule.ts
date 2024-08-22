import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";
import {
  date,
  datetime,
  id,
  monthday,
  number,
  string,
  weekday,
} from "@/validation/utils";
import { IRule, IUser } from "@litespace/types";
import { badRequest, forbidden } from "@/lib/error";
import { calls, rules } from "@/models";
import { Rule, Schedule, asRule, unpackRules } from "@litespace/sol";

const createRulePayload = zod.object({
  title: zod.string().min(5).max(255),
  frequence: number,
  start: datetime,
  end: datetime,
  time: string,
  duration: number,
  weekday: zod.optional(zod.array(weekday)),
  monthday: zod.optional(monthday),
});
const findUserRulesPayload = zod.object({ userId: id });

const findUnpackedUserRulesParams = zod.object({ userId: id });

const findUnpackedUserRulesQuery = zod.object({
  start: date,
  end: date,
});

async function createRule(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id;
  const role = req.user?.role;
  const eligible = role === IUser.Role.Interviewer || role === IUser.Role.Tutor;
  if (!eligible || !userId) return next(forbidden());

  const payload: IRule.CreateApiPayload = createRulePayload.parse(req.body);
  const existingRules = await rules.findByUserId(userId);
  const incomingRule: Rule = asRule(payload);

  for (const rule of existingRules) {
    if (Schedule.from(asRule(rule)).intersecting(incomingRule))
      return next(badRequest());
  }
  const rule = await rules.create({ ...payload, userId });
  res.status(201).json(rule);
}

async function findUserRules(req: Request, res: Response, next: NextFunction) {
  const currentUserId = req.user?.id;
  if (!currentUserId) return next(forbidden());

  const { userId: targetUserId } = findUserRulesPayload.parse(req.params);
  const userRules = await rules.findByUserId(targetUserId);
  res.status(200).json(userRules);
}

async function findUnpackedUserRules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentUserId = req.user?.id;
  if (!currentUserId) return next(forbidden());

  const { userId: targetUserId } = findUnpackedUserRulesParams.parse(
    req.params
  );
  const { start, end } = findUnpackedUserRulesQuery.parse(req.query);

  const [userRules, userCalls] = await Promise.all([
    rules.findByUserId(targetUserId),
    calls.findByHostId(targetUserId, { start, end }),
  ]);

  const list = unpackRules({
    rules: userRules,
    calls: userCalls,
    start,
    end,
  });

  res.status(200).json({
    rules: userRules,
    unpacked: list,
  });
}

export default {
  createRule: asyncHandler(createRule),
  findUserRules: asyncHandler(findUserRules),
  findUnpackedUserRules: asyncHandler(findUnpackedUserRules),
};
