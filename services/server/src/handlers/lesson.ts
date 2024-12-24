import { NextFunction, Request, Response } from "express";
import zod from "zod";
import {
  datetime,
  duration,
  id,
  jsonBoolean,
  pageNumber,
  pageSize,
  withNamedId,
} from "@/validation/utils";
import { bad, busyTutor, forbidden, notfound } from "@/lib/error";
import { ILesson, IRule, IUser, Wss } from "@litespace/types";
import { lessons, rules, users, knex, rooms } from "@litespace/models";
import { Knex } from "knex";
import safeRequest from "express-async-handler";
import { ApiContext } from "@/types/api";
import { calculateLessonPrice } from "@litespace/sol/lesson";
import { safe } from "@litespace/sol/error";
import { unpackRules } from "@litespace/sol/rule";
import { isAdmin, isStudent, isUser } from "@litespace/auth";
import { platformConfig } from "@/constants";
import dayjs from "@/lib/dayjs";
import { canBook } from "@/lib/session";
import { concat, isEqual } from "lodash";
import { genSessionId } from "@litespace/sol";

const createLessonPayload = zod.object({
  tutorId: id,
  ruleId: id,
  start: datetime,
  duration,
});

const findLessonsQuery = zod.object({
  users: zod.optional(zod.array(id)),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
  ratified: zod.optional(jsonBoolean),
  canceled: zod.optional(jsonBoolean),
  future: zod.optional(jsonBoolean),
  past: zod.optional(jsonBoolean),
  now: zod.optional(jsonBoolean),
  after: zod.optional(zod.string().datetime()),
  before: zod.optional(zod.string().datetime()),
  full: zod.optional(jsonBoolean),
});

function create(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isStudent(user);
      if (!allowed) return next(forbidden());

      const payload: ILesson.CreateApiPayload = createLessonPayload.parse(
        req.body
      );
      const tutor = await users.findById(payload.tutorId);
      if (!tutor) return next(notfound.tutor());

      const rule = await rules.findById(payload.ruleId);
      if (!rule) return next(notfound.rule());

      const price = calculateLessonPrice(
        platformConfig.tutorHourlyRate,
        payload.duration
      );

      const roomMembers = [user.id, tutor.id];
      const room = await rooms.findRoomByMembers(roomMembers);
      if (!room) await rooms.create(roomMembers);

      const ruleLessons = await lessons.find({
        rules: [rule.id],
        full: true,
        canceled: false, // ignore canceled lessons
      });

      const canBookLesson = canBook({
        rule,
        lessons: ruleLessons.list,
        slot: { start: payload.start, duration: payload.duration },
      });
      if (!canBookLesson) return next(busyTutor());

      const { lesson } = await knex.transaction(
        async (tx: Knex.Transaction) => {
          const lesson = await lessons.create({
            tutor: payload.tutorId,
            student: user.id,
            start: payload.start,
            duration: payload.duration,
            rule: payload.ruleId,
            session: genSessionId("lesson"),
            price,
            tx,
          });
          return lesson;
        }
      );

      const response: ILesson.CreateLessonApiResponse = lesson;
      res.status(200).json(response);

      const error = await safe(async () => {
        const slots: IRule.Slot[] = concat(ruleLessons.list, lesson).map(
          (lesson) => ({
            ruleId: lesson.ruleId,
            start: lesson.start,
            duration: lesson.duration,
          })
        );
        const today = dayjs.utc().startOf("day");
        const payload = {
          tutor: tutor.id,
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
            slots,
          }),
        };

        context.io.sockets
          .in(Wss.Room.TutorsCache)
          .emit(Wss.ServerEvent.LessonBooked, payload);
      });
      if (error instanceof Error) console.error(error);
    }
  );
}

async function findLessons(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const query: ILesson.FindLessonsApiQuery = findLessonsQuery.parse(req.query);
  const allowed =
    (isUser(user) && query.users && isEqual(query.users, [user.id])) ||
    isAdmin(user);
  if (!allowed) return next(forbidden());

  /**
   * The `full` flag can be used only if the `after` and `before` params are
   * provided and the period between them is less than equal to 2 weeks.
   *
   *
   * @note why expose the `full` flag?
   *
   * Client will need to display all lessons available for a given week (e.g.,
   * weekly calendar). By providing the `full` flag, it will be able to get all
   * lessons of the week in one single request.
   */

  const canUseFullFlag =
    query.after &&
    query.before &&
    dayjs.utc(query.before).diff(query.after, "days") <= 14;

  if (query.full && !canUseFullFlag) return next(bad());

  const { list: userLessons, total } = await lessons.find({
    users: query.users,
    ratified: query.ratified,
    canceled: query.canceled,
    future: query.future,
    past: query.past,
    now: query.now,
    after: query.after,
    before: query.before,
    page: query.page,
    size: query.size,
    full: query.full,
  });

  const userLesonsIds = userLessons.map((lesson) => lesson.id);
  const lessonMembers = await lessons.findLessonMembers(userLesonsIds);

  const result: ILesson.FindUserLessonsApiResponse = {
    list: userLessons.map((lesson) => {
      const members = lessonMembers.filter(
        (member) => member.lessonId === lesson.id
      );
      return { lesson, members };
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
      if (!lesson) return next(notfound.lesson());

      const members = await lessons.findLessonMembers([lessonId]);
      const member = members.map((member) => member.userId).includes(user.id);
      if (!member) return next(forbidden());

      await lessons.cancel({
        canceledBy: user.id,
        id: lessonId,
      });

      res.status(200).send();

      //! todo: cache updates should be done at the worker thread
      const error = await safe(async () => {
        const ruleLessons = await lessons.find({
          rules: [lesson.ruleId],
          full: true,
          canceled: false,
        });

        const slots: IRule.Slot[] = concat(ruleLessons.list, lesson).map(
          (lesson) => ({
            ruleId: lesson.ruleId,
            start: lesson.start,
            duration: lesson.duration,
          })
        );

        const tutor = members.find(
          (member) => member.role === IUser.Role.Tutor
        );

        if (!tutor)
          throw new Error(
            "Tutor not found in the lesson members; should never happen."
          );

        const rule = await rules.findById(lesson.ruleId);
        if (!rule) throw new Error("Rule not found; should never happen");

        const today = dayjs.utc().startOf("day");
        const payload = {
          tutor: tutor.userId,
          rule: lesson.ruleId,
          events: unpackRules({
            start: today.toISOString(),
            end: today.add(30, "days").toISOString(),
            rules: [rule],
            slots,
          }),
        };

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
  findLessons: safeRequest(findLessons),
};
