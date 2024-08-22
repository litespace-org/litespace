import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";
import {
  datetime,
  monthday,
  number,
  string,
  weekday,
} from "@/validation/utils";
import { IRule, IUser } from "@litespace/types";
import { badRequest, forbidden } from "@/lib/error";
import { rules } from "@/models";
import { Rule, Schedule, asRule } from "@litespace/sol";
import { merge } from "lodash";

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

export default {
  createRule: asyncHandler(createRule),
};
