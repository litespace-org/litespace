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
import { badRequest, forbidden, notfound } from "@/lib/error";
import { calls, rules } from "@litespace/models";
import { Rule, Schedule, asRule, unpackRules } from "@litespace/sol";
import { isEmpty } from "lodash";

const title = zod.string().min(5).max(255);
const createRulePayload = zod.object({
  title,
  frequency: number,
  start: datetime,
  end: datetime,
  time: string,
  duration: number,
  weekday: zod.optional(zod.array(weekday)),
  monthday: zod.optional(monthday),
});
const findUserRulesPayload = zod.object({ userId: id });
const findUnpackedUserRulesParams = zod.object({ userId: id });
const findUnpackedUserRulesQuery = zod.object({ start: date, end: date });
const updateRuleParams = zod.object({ ruleId: id });
const deleteRuleParams = zod.object({ ruleId: id });
const updateRulePayload = zod.object({
  title: zod.optional(title),
  frequency: zod.optional(number),
  start: zod.optional(datetime),
  end: zod.optional(datetime),
  time: zod.optional(string),
  duration: zod.optional(number),
  weekday: zod.optional(zod.array(weekday)),
  monthday: zod.optional(monthday),
  activated: zod.optional(zod.boolean()),
});

async function createRule(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id;
  const role = req.user?.role;
  const eligible = role === IUser.Role.Interviewer || role === IUser.Role.Tutor;
  if (!eligible || !userId) return next(forbidden());

  const payload: IRule.CreateApiPayload = createRulePayload.parse(req.body);
  const existingRules = await rules.findByUserId({
    user: userId,
    deleted: false, // skip deleted rules
  });
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
  const userRules = await rules.findByUserId({
    user: targetUserId,
    deleted: false, // skip deleted rules
  });
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
    rules.findByUserId({ user: targetUserId, deleted: false }),
    calls.findMemberCalls({
      userIds: [targetUserId],
      between: { start, end },
      ignoreCanceled: true,
    }),
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

async function updateRule(req: Request, res: Response, next: NextFunction) {
  const payload: IRule.UpdateApiPayload = updateRulePayload.parse(req.body);
  const { ruleId } = updateRuleParams.parse(req.params);
  const userId = req.user?.id;
  if (!userId) return next(forbidden());

  const rule = await rules.findById(ruleId);
  if (!rule || rule.deleted) return next(notfound.base());

  const owner = rule.userId === userId;
  if (!owner) return next(forbidden());

  const withUpdates: IRule.Self = { ...rule, ...payload };
  const existingRules = await rules.findByUserId({
    user: userId,
    deleted: false, // ignore deleted rules
  });
  const otherRules = existingRules.filter((rule) => rule.id !== withUpdates.id);
  for (const rule of otherRules) {
    if (Schedule.from(asRule(rule)).intersecting(asRule(withUpdates)))
      return next(badRequest());
  }

  const updatedRule = await rules.update(ruleId, {
    title: payload.title,
    frequency: payload.frequency,
    start: payload.start,
    end: payload.end,
    time: payload.time,
    duration: payload.duration,
    weekdays: payload.weekdays,
    monthday: payload.monthday,
    activated: payload.activated,
  });
  res.status(200).json(updatedRule);
}

async function deleteRule(req: Request, res: Response, next: NextFunction) {
  const { ruleId } = deleteRuleParams.parse(req.params);
  const userId = req.user?.id;
  if (!userId) return next(forbidden());

  const rule = await rules.findById(ruleId);
  if (!rule) return next(notfound.base());

  const owner = rule.userId === userId;
  if (!owner) return next(forbidden());

  const ruleCalls = await calls.findByRuleId({ rule: ruleId });
  const deletable = isEmpty(ruleCalls);

  const deletedRule = deletable
    ? await rules.delete(ruleId)
    : await rules.update(ruleId, { deleted: true });

  res.status(204).json(deletedRule);
}

export default {
  createRule: asyncHandler(createRule),
  findUserRules: asyncHandler(findUserRules),
  findUnpackedUserRules: asyncHandler(findUnpackedUserRules),
  updateRule: asyncHandler(updateRule),
  deleteRule: asyncHandler(deleteRule),
};
