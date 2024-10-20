import { NextFunction, Request, Response } from "express";
import zod from "zod";
import {
  datetime,
  duration,
  id,
  pagination,
  withNamedId,
} from "@/validation/utils";
import { bad, forbidden, notfound, unexpected } from "@/lib/error";
import { ILesson, IUser, Wss } from "@litespace/types";
import { calls, lessons, rules, users, knex, rooms } from "@litespace/models";
import { Knex } from "knex";
import safeRequest from "express-async-handler";
import { ApiContext } from "@/types/api";
import { calculateLessonPrice, safe, unpackRules } from "@litespace/sol";
import { map } from "lodash";
import { isAdmin, isUser } from "@litespace/auth";
import { platformConfig } from "@/constants";
import { cache } from "@/lib/cache";
import dayjs from "@/lib/dayjs";
import { canBook } from "@/lib/call";

const createLessonPayload = zod.object({
  tutorId: id,
  ruleId: id,
  start: datetime,
  duration,
});

function create(context: ApiContext) {
  return safeRequest(
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

      const roomMembers = [userId, tutor.id];
      const room = await rooms.findRoomByMembers(roomMembers);
      if (!room) await rooms.create(roomMembers);

      const ruleCalls = await calls.findByRuleId({
        rule: rule.id,
        canceled: false, // ignore canceled calls
      });

      const canBookLesson = canBook({
        rule,
        calls: ruleCalls,
        call: {
          start: payload.start,
          duration: payload.duration,
        },
      });
      if (!canBookLesson) return next(bad());

      const { call, lesson } = await knex.transaction(
        async (tx: Knex.Transaction) => {
          const { call } = await calls.create(
            {
              duration: payload.duration,
              host: payload.tutorId,
              members: [userId],
              rule: payload.ruleId,
              start: payload.start,
            },
            tx
          );

          const lesson = await lessons.create(
            {
              call: call.id,
              host: payload.tutorId,
              members: [userId],
              price,
            },
            tx
          );

          return { call, lesson };
        }
      );

      res.status(200).json({ call, lesson });

      const error = await safe(async () => {
        const ruleCalls = await calls.findByRuleId({
          rule: rule.id,
          canceled: false, // ignore canceled calls
        });
        const today = dayjs.utc().startOf("day");
        const payload = {
          tutor: tutor.id,
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            calls: ruleCalls,
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
          }),
        };

        await cache.rules.setOne(payload);

        context.io.sockets
          .in(Wss.Room.TutorsCache)
          .emit(Wss.ServerEvent.LessonBooked, payload);
      });
      if (error instanceof Error) console.error(error);
    }
  );
}

async function findUserLessons(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = withNamedId("id").parse(req.params);
  const user = req.user;
  const allowed = (isUser(user) && user.id === id) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const query = pagination.parse(req.query);
  const { list: userLessons, total } = await lessons.findMemberLessons(
    [id],
    query
  );
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
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isUser(user);
      if (!allowed) return next(forbidden());

      const { lessonId } = withNamedId("lessonId").parse(req.params);
      const lesson = await lessons.findById(lessonId);
      if (!lesson) return next(notfound.base());

      const call = await calls.findById(lesson.callId);
      if (!call) return next(notfound.base());

      const members = await lessons.findLessonMembers([lessonId]);
      const member = members.map((member) => member.userId).includes(user.id);
      if (!member) return next(forbidden());

      await knex.transaction(async (tx: Knex.Transaction) => {
        await lessons.cancel(lessonId, user.id, tx);
        await calls.cancel(lesson.callId, user.id, tx);
      });

      res.status(200).send();

      const error = await safe(async () => {
        const ruleCalls = await calls.findByRuleId({
          rule: call.ruleId,
          canceled: false, // ignore canceled calls
        });
        const host = members.find((member) => member.host);
        if (!host) throw new Error("Unxpected error; lesson has no host");

        const rule = await rules.findById(call.ruleId);
        if (!rule) throw new Error("Rule not found; should never happen");

        const today = dayjs.utc().startOf("day");
        const payload = {
          tutor: host.userId,
          rule: call.ruleId,
          events: unpackRules({
            rules: [rule],
            calls: ruleCalls,
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
          }),
        };
        // update tutor rules cache
        await cache.rules.setOne(payload);
        // notify client
        context.io.sockets
          .to(Wss.Room.TutorsCache)
          .emit(Wss.ServerEvent.LessonCanceled, payload);
      });
      if (error instanceof Error) console.error(error);
    }
  );
}

export default {
  create,
  cancel,
  findUserLessons: safeRequest(findUserLessons),
};
