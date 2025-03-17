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
import {
  bad,
  busyTutor,
  reachedBookingLimit,
  forbidden,
  notfound,
} from "@/lib/error";
import { ILesson, IUser, Wss } from "@litespace/types";
import {
  lessons,
  users,
  knex,
  rooms,
  availabilitySlots,
  interviews,
} from "@litespace/models";
import { Knex } from "knex";
import safeRequest from "express-async-handler";
import { ApiContext } from "@/types/api";
import { calculateLessonPrice } from "@litespace/utils/lesson";
import { safe } from "@litespace/utils/error";
import { isAdmin, isStudent, isTutorManager, isUser } from "@litespace/auth";
import { MAX_FULL_FLAG_DAYS, platformConfig } from "@/constants";
import dayjs from "@/lib/dayjs";
import { asSubSlots, canBook } from "@litespace/utils/availabilitySlots";
import { isEmpty, isEqual } from "lodash";
import { genSessionId } from "@litespace/utils";
import { withImageUrls } from "@/lib/user";

const createLessonPayload = zod.object({
  tutorId: id,
  slotId: id,
  start: datetime,
  duration,
});

const updateLessonPayload = zod.object({
  lessonId: id,
  slotId: id,
  start: datetime,
  duration: duration,
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

      const slot = await availabilitySlots.findById(payload.slotId);
      if (!slot) return next(notfound.slot());

      // Lesson should be in the future
      if (dayjs.utc(payload.start).isBefore(dayjs.utc())) return next(bad());

      // User is allowed to have only one not-canceled lesson at a time.
      const userLessons = await lessons.find({
        users: [user.id],
        after: dayjs.utc().toISOString(),
        canceled: false,
      });
      if (userLessons.total !== 0) return next(reachedBookingLimit());

      const price = isTutorManager(tutor)
        ? 0
        : calculateLessonPrice(
            platformConfig.tutorHourlyRate,
            payload.duration
          );

      // Check if the new lessons intercepts any of current subslots
      const slotLessons = await lessons.find({
        slots: [slot.id],
        full: true,
        canceled: false, // Ignore canceled lessons
      });

      const slotInterviews = await interviews.find({
        slots: [slot.id],
        full: true,
        canceled: false,
      });

      const canBookLesson = canBook({
        slot,
        bookedSubslots: asSubSlots([
          ...slotLessons.list,
          ...slotInterviews.list,
        ]),
        bookInfo: { start: payload.start, duration: payload.duration },
      });
      if (!canBookLesson) return next(busyTutor());

      // create the lesson with its associated room if it doesn't exist
      const roomMembers = [user.id, tutor.id];
      const room = await rooms.findRoomByMembers(roomMembers);

      const { lesson } = await knex.transaction(
        async (tx: Knex.Transaction) => {
          if (!room) await rooms.create(roomMembers, tx);
          const lesson = await lessons.create({
            tutor: payload.tutorId,
            student: user.id,
            start: payload.start,
            duration: payload.duration,
            slot: payload.slotId,
            session: genSessionId("lesson"),
            price,
            tx,
          });
          return lesson;
        }
      );

      const response: ILesson.CreateLessonApiResponse = lesson;
      res.status(200).json(response);

      context.io.sockets
        .in(Wss.Room.TutorsCache)
        .emit(Wss.ServerEvent.LessonBooked, {
          tutor: tutor.id,
          lesson: lesson.id,
        });
    }
  );
}

function update(context: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      const allowed = isStudent(user);
      if (!allowed) return next(forbidden());

      const payload: ILesson.UpdateApiPayload = updateLessonPayload.parse(
        req.body
      );

      const lesson = await lessons.findById(payload.lessonId);
      if (!lesson) return next(notfound.lesson());

      const members = await lessons.findLessonMembers([payload.lessonId]);
      const member = members.find((member) => member.userId === user.id);
      if (!member) return next(forbidden());

      const tutor = members.find((member) => member.userId !== user.id);
      if (!tutor) return next(bad());

      const slot = await availabilitySlots.findById(payload.slotId);
      if (!slot) return next(notfound.slot());

      const slotLessons = await lessons.find({
        slots: [slot.id],
        full: true,
        canceled: false, // ignore canceled lessons
      });

      const slotInterviews = await interviews.find({
        slots: [slot.id],
        canceled: false,
        full: true,
      });

      const canBookLesson = canBook({
        slot,
        bookedSubslots: asSubSlots([
          ...slotLessons.list.filter(
            (lesson) => lesson.id !== payload.lessonId
          ),
          ...slotInterviews.list,
        ]),
        bookInfo: {
          start: payload.start || lesson.start,
          duration: payload.duration || lesson.duration,
        },
      });
      if (!canBookLesson) return next(busyTutor());

      await lessons.update(payload.lessonId, {
        start: payload.start,
        duration: payload.duration,
        slotId: payload.slotId,
      });

      res.sendStatus(200);

      // notify tutors that lessons have been rebooked
      context.io.sockets
        .in(Wss.Room.TutorsCache)
        .emit(Wss.ServerEvent.LessonRebooked, {
          tutor: tutor.userId,
          lesson: lesson.id,
        });
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
    dayjs.utc(query.before).diff(query.after, "days") <= MAX_FULL_FLAG_DAYS;

  if (query.full && !canUseFullFlag) return next(bad());

  const { list: userLessons, total } = await lessons.find({
    users: query.users,
    ratified: query.ratified,
    canceled: query.canceled,
    after: query.after,
    before: query.before,
    page: query.page,
    size: query.size,
    full: query.full,
  });

  const userLesonsIds = userLessons.map((lesson) => lesson.id);
  const lessonMembers = await withImageUrls(
    await lessons.findLessonMembers(userLesonsIds)
  );

  const result: ILesson.FindUserLessonsApiResponse = {
    list: userLessons.map((lesson) => {
      const members = lessonMembers
        .filter((member) => member.lessonId === lesson.id)
        .map((member) => ({
          ...member,
          // mask private information
          phone: null,
          verifiedPhone: false,
        }));
      return { lesson, members };
    }),
    total,
  };

  res.status(200).json(result);
}

async function findLessonById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { id } = withNamedId("id").parse(req.params);
  const [lesson, members] = await Promise.all([
    lessons.findById(id),
    lessons.findLessonMembers([id]),
  ]);
  if (!lesson || isEmpty(members)) return next(notfound.lesson());

  const isMember = !!members.find((member) => member.userId === user.id);
  if (!isMember) return next(forbidden());

  const response: ILesson.FindLessonByIdApiResponse = {
    lesson,
    members: members.map((member) => ({
      ...member,
      // mask private information
      phone: null,
      verifiedPhone: false,
    })),
  };

  res.status(200).json(response);
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
        ids: [lessonId],
      });

      res.status(200).send();

      //! todo: cache updates should be done at the worker thread
      const error = await safe(async () => {
        const tutor = members.find(
          (member) => member.role === IUser.Role.Tutor
        );

        if (!tutor)
          throw new Error(
            "Tutor not found in the lesson members; should never happen."
          );

        const slot = await availabilitySlots.findById(lesson.slotId);
        if (!slot) throw new Error("Slot not found; should never happen");

        const payload = {
          tutor: tutor.userId,
          lesson: lesson.id,
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
  update,
  findLessons: safeRequest(findLessons),
  findLessonById: safeRequest(findLessonById),
};
