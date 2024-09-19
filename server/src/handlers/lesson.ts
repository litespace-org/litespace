import { NextFunction, Request, Response } from "express";
import zod from "zod";
import {
  datetime,
  duration,
  id,
  pagination,
  withNamedId,
} from "@/validation/utils";
import { forbidden, notfound, unexpected } from "@/lib/error";
import { ILesson, IRule, IUser } from "@litespace/types";
import { calls, lessons, rules, users, knex, count } from "@litespace/models";
import { Knex } from "knex";
import asyncHandler from "express-async-handler";
import { ApiContext } from "@/types/api";
import dayjs from "@/lib/dayjs";
import { availableTutorsCache } from "@/redis/tutor";
import { Schedule, unpackRules, calculateLessonPrice } from "@litespace/sol";
import { map } from "lodash";
import { authorizer } from "@litespace/auth";
import { platformConfig } from "@/constants";

const createLessonPayload = zod.object({
  tutorId: id,
  ruleId: id,
  start: datetime,
  duration,
});

function create(context: ApiContext) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      const role = req.user?.role;
      const student = role === IUser.Role.Student;
      if (!userId || !student) return next(forbidden());

      const payload: ILesson.CreateApiPayload = createLessonPayload.parse(
        req.body
      );
      const tutor = await users.findById(payload.tutorId);
      if (!tutor) return next(notfound.base());

      const rule = await rules.findById(payload.ruleId);
      if (!rule) return next(notfound.base());

      const price = calculateLessonPrice(
        platformConfig.tutorHourlyRate,
        payload.duration
      );

      // todo: check if a tutor has the time for the lesson
      // todo: update the global available tutors cache

      const { call, lesson } = await knex.transaction(
        async (tx: Knex.Transaction) => {
          const { call } = await calls.create(
            {
              duration: payload.duration,
              hostId: payload.tutorId,
              memberIds: [userId],
              ruleId: payload.ruleId,
              start: payload.start,
            },
            tx
          );

          const lesson = await lessons.create(
            {
              callId: call.id,
              hostId: payload.tutorId,
              members: [userId],
              price,
            },
            tx
          );

          return { call, lesson };
        }
      );

      res.status(200).json({ call, lesson });

      const dates = await availableTutorsCache.getDates();
      const rulesMap = await availableTutorsCache.getRules();
      if (!rulesMap || !dates.start || !dates.end) return;

      const start = payload.start;
      const end = dayjs.utc(start).add(payload.duration, "minutes");
      const tutorId = payload.tutorId.toString();
      const lessonEvent = Schedule.event(start, end);
      const tutorRules = rulesMap[tutorId] || [];
      const ruleSlotIndex = tutorRules.findIndex((rule) =>
        Schedule.isContained(rule, lessonEvent)
      );
      if (ruleSlotIndex === -1) return;

      const target = tutorRules[ruleSlotIndex];
      const mask = [lessonEvent];
      const events: IRule.RuleEvent[] = Schedule.splitBy(target, mask).map(
        (event) => ({ id: target.id, ...event })
      );

      // replace old rule events with the new events
      const updatedRules = tutorRules.splice(ruleSlotIndex, 1, ...events);
      rulesMap[tutorId] = updatedRules;
      await availableTutorsCache.setRules(rulesMap);
      // notify client about the updated cache
      context.io.emit("updated"); // todo
    }
  );
}

async function findUserLessons(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = withNamedId("id").parse(req.params);
  const allowed = authorizer().admin().owner(id).check(req.user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const total = await count(lessons.table.lessons);
  const userLessons = await lessons.findMemberLessons([id], query);
  const lessonMembers = await lessons.findLessonMembers(map(userLessons, "id"));
  const lessonCalls = await calls.findByIds(map(userLessons, "callId"));

  const result: ILesson.FindUserLessonsApiResponse = {
    list: userLessons.map((lesson) => {
      const members = lessonMembers.filter(
        (member) => member.lessonId === lesson.id
      );

      const call = lessonCalls.find((call) => call.id === lesson.callId);
      if (!call) throw unexpected();

      return { lesson, members, call };
    }),
    total,
  };

  res.status(200).json(result);
}

function cancel(context: ApiContext) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      if (!userId) return next(forbidden());

      const { lessonId } = withNamedId("lessonId").parse(req.params);
      const lesson = await lessons.findById(lessonId);
      if (!lesson) return next(notfound.base());

      const members = await lessons.findLessonMembers([lessonId]);
      const member = map(members, "userId").includes(userId);
      if (!member) return next(forbidden());

      await knex.transaction(async (tx: Knex.Transaction) => {
        await lessons.cancel(lessonId, userId, tx);
        await calls.cancel(lesson.callId, userId, tx);
      });

      res.status(200).send();

      // revert the cache
      const dates = await availableTutorsCache.getDates();
      const cachedRules = await availableTutorsCache.getRules();
      const tutorId = members.find((member) => member.host)?.userId;
      if (!cachedRules || !dates.start || !dates.end || !tutorId) return;

      const start = dates.start.toISOString();
      const end = dates.start.toISOString();
      const tutorCalls = await calls.findMemberCalls({
        userIds: [tutorId],
        ignoreCanceled: true,
        between: { start, end },
      });

      const tutorRules = await rules.findActivatedRules(
        [tutorId],
        dates.start.toISOString()
      );

      const unpackedRules = unpackRules({
        rules: tutorRules,
        calls: tutorCalls,
        start,
        end,
      });

      cachedRules[tutorId.toString()] = unpackedRules;
      await availableTutorsCache.setRules(cachedRules);
      context.io.emit("updated"); // todo
    }
  );
}

export default {
  create,
  cancel,
  findUserLessons: asyncHandler(findUserLessons),
};
