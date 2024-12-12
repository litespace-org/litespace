import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
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
import { IRule, Wss } from "@litespace/types";
import { bad, contradictingRules, forbidden, notfound } from "@/lib/error";
import { interviews, lessons, rules, tutors } from "@litespace/models";
import {
  Rule,
  Schedule,
  asRule,
  asSlots,
  unpackRules,
} from "@litespace/sol/rule";
import { safe } from "@litespace/sol/error";
import { isEmpty } from "lodash";
import { ApiContext } from "@/types/api";
import { cache } from "@/lib/cache";
import dayjs from "@/lib/dayjs";
import { isInterviewer, isTutor, isUser } from "@litespace/auth";
import { isOnboard } from "@/lib/tutor";

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

const findUserRulesWithSlotsParams = zod.object({ userId: id });
const findUserRulesWithSlotsQuery = zod.object({
  after: datetime,
  before: datetime,
});

const updateRuleParams = zod.object({ ruleId: id });
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

const deleteRuleParams = zod.object({ ruleId: id });

function createRule(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isTutor(user) || isInterviewer(user);
      if (!allowed) return next(forbidden());

      const payload: IRule.CreateApiPayload = createRulePayload.parse(req.body);
      const existingRules = await rules.findByUserId({
        user: user.id,
        deleted: false, // skip deleted rules
      });
      const incomingRule: Rule = asRule(payload);

      for (const rule of existingRules) {
        if (Schedule.from(asRule(rule)).intersecting(incomingRule))
          return next(contradictingRules());
      }
      const rule = await rules.create({ ...payload, userId: user.id });
      res.status(201).json(rule);

      const error = await safe(async () => {
        const today = dayjs.utc().startOf("day");
        await cache.rules.setOne({
          tutor: rule.userId,
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            slots: [],
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
          }),
        });
        context.io.to(Wss.Room.TutorsCache).emit(Wss.ServerEvent.RuleCreated);
      });
      if (error instanceof Error) console.log(error);
    }
  );
}

async function findUserRules(req: Request, res: Response, next: NextFunction) {
  const allowed = isUser(req.user);
  if (!allowed) return next(forbidden());

  const { userId } = findUserRulesPayload.parse(req.params);
  const userRules = await rules.findByUserId({
    user: userId,
    deleted: false, // skip deleted rules
  });
  res.status(200).json(userRules);
}

/**
 *  @deprecated should be removed in favor of {@link findUserRulesWithSlots}
 */
async function findUnpackedUserRules(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = isUser(req.user);
  if (!allowed) return next(forbidden());

  const { userId } = findUnpackedUserRulesParams.parse(req.params);
  const { start, end } = findUnpackedUserRulesQuery.parse(req.query);

  // todo: include interviews incase of a interviewer
  const [userRules, userLessons] = await Promise.all([
    rules.findByUserId({ user: userId, deleted: false }),
    lessons.find({
      users: [userId],
      after: start,
      before: end,
      full: true,
      canceled: false,
    }),
  ]);

  const slots: IRule.Slot[] = userLessons.list.map((lesson) => ({
    ruleId: lesson.ruleId,
    start: lesson.start,
    duration: lesson.duration,
  }));

  const list = unpackRules({
    rules: userRules,
    slots,
    start,
    end,
  });

  // todo: add types for the api response (IRule.FindUnpackedUserRulesApiResponse)
  res.status(200).json({
    rules: userRules,
    unpacked: list,
  });
}

/**
 * Respond with user's (e.g. tutor) IRule.Self objects that lay between two dates,
 * along with the occupied slots.
 */
async function findUserRulesWithSlots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = isUser(req.user);
  if (!allowed) return next(forbidden());

  const { userId } = findUserRulesWithSlotsParams.parse(req.params);
  const { after, before } = findUserRulesWithSlotsQuery.parse(req.query);

  // return 400 status code if the diff between after and before is more than 60 days
  if (dayjs(before).diff(dayjs(after), "day") > 60) return next(bad());

  // check if the userId is for a tutor or tutor-manager; return 404 if it's not
  const tutor = await tutors.findById(userId);
  if (tutor === null)
    // TODO: add condition for tutor-manager
    return next(notfound.tutor());

  // if the user is a tutor but not onboard then return 404
  if (tutor && !isOnboard(tutor)) return next(notfound.tutor());

  // get (not deleted) rules from the database,
  // that fully or partially lay between `after` and `before`.
  const userRules = await rules.findActivatedRulesBetween({
    userId,
    after,
    before,
  });

  // get (not canceled) lessons and interviews then generate slots from them
  const ruleIds = userRules.map((rule) => rule.id);
  const ruleLessons = await lessons.find({ rules: ruleIds, canceled: false });
  const ruleInterviews = await interviews.find({
    rules: ruleIds,
    cancelled: false,
  });

  // return the response to the client
  const response: IRule.FindUserRulesWithSlotsApiResponse = {
    rules: userRules,
    slots: [...asSlots(ruleLessons.list), ...asSlots(ruleInterviews.list)],
  };

  res.status(200).json(response);
}

function updateRule(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isUser(user);
      if (!allowed) return next(forbidden());

      const payload: IRule.UpdateApiPayload = updateRulePayload.parse(req.body);
      const { ruleId } = updateRuleParams.parse(req.params);
      const rule = await rules.findById(ruleId);
      if (!rule || rule.deleted) return next(notfound.rule());

      const owner = rule.userId === user.id;
      if (!owner) return next(forbidden());

      const withUpdates: IRule.Self = { ...rule, ...payload };
      const existingRules = await rules.findByUserId({
        user: user.id,
        deleted: false, // ignore deleted rules
      });
      const otherRules = existingRules.filter(
        (rule) => rule.id !== withUpdates.id
      );
      for (const rule of otherRules) {
        if (Schedule.from(asRule(rule)).intersecting(asRule(withUpdates)))
          return next(contradictingRules());
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

      const error = await safe(async () => {
        const today = dayjs.utc().startOf("day");
        const ruleLessons = await lessons.find({
          rules: [rule.id],
          canceled: false,
          full: true,
        });

        await cache.rules.setOne({
          tutor: rule.userId,
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            slots: asSlots(ruleLessons.list),
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
          }),
        });
        context.io.to(Wss.Room.TutorsCache).emit(Wss.ServerEvent.RuleUpdated);
      });
      if (error instanceof Error) console.log(error);
    }
  );
}

function deleteRule(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isUser(user);
      if (!allowed) return next(forbidden());
      const { ruleId } = deleteRuleParams.parse(req.params);

      const rule = await rules.findById(ruleId);
      if (!rule) return next(notfound.rule());

      const owner = rule.userId === user.id;
      if (!owner) return next(forbidden());

      const ruleLessons = await lessons.find({
        rules: [ruleId],
        canceled: false,
        full: true,
      });
      const deletable = isEmpty(ruleLessons);

      const deletedRule = deletable
        ? await rules.delete(ruleId)
        : await rules.update(ruleId, { deleted: true });

      res.status(204).json(deletedRule);

      const error = await safe(async () => {
        await cache.rules.deleteOne({ tutor: rule.userId, rule: rule.id });
        context.io.to(Wss.Room.TutorsCache).emit(Wss.ServerEvent.RuleDeleted);
      });
      if (error instanceof Error) console.log(error);
    }
  );
}

export default {
  findUnpackedUserRules: safeRequest(findUnpackedUserRules),
  findUserRules: safeRequest(findUserRules),
  findUserRulesWithSlots: safeRequest(findUserRulesWithSlots),
  createRule,
  updateRule,
  deleteRule,
};
