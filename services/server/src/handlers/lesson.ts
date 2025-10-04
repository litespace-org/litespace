import { NextFunction, Request, Response } from "express";
import zod, { ZodSchema } from "zod";
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
  forbidden,
  notfound,
  noEnoughMinutes,
  illegal,
  lessonTimePassed,
  weekBoundariesViolation,
  lessonAlreadyStarted,
  lessonNotStarted,
  fawryError,
} from "@/lib/error/api";
import {
  IAvailabilitySlot,
  ILesson,
  ITransaction,
  Wss,
} from "@litespace/types";
import {
  lessons,
  users,
  knex,
  rooms,
  availabilitySlots,
  subscriptions,
} from "@litespace/models";
import { Knex } from "knex";
import safeRequest from "express-async-handler";
import { ApiContext } from "@/types/api";
import { calculateLessonPrice } from "@litespace/utils/lesson";
import {
  isAdmin,
  isStudent,
  isTutor,
  isTutorManager,
  isUser,
} from "@litespace/utils/user";
import { MAX_FULL_FLAG_DAYS, platformConfig } from "@/constants";
import { first, isEmpty, isEqual } from "lodash";
import { AFRICA_CAIRO_TIMEZONE, genSessionId, price } from "@litespace/utils";
import { withImageUrls, withPhone } from "@/lib/user";
import dayjs from "@/lib/dayjs";
import {
  calcRemainingWeeklyMinutesBySubscription,
  generateFreeSubscription,
} from "@/lib/subscription";
import {
  getCurrentWeekBoundaries,
  getPseudoWeekBoundaries,
  isPseudoSubscription,
} from "@litespace/utils/subscription";
import { getDayLessonsMap, inflateDayLessonsMap } from "@/lib/lesson";
import { isBookable } from "@/lib/session";
import { sendMsg } from "@/lib/messenger";
import { createPaidLessonTx } from "@/lib/transaction";
import { performPayWithCardTx, performPayWithEWalletTx } from "@/lib/fawry";
import { FawryError } from "@/lib/error/local";

const createLessonPayload: ZodSchema<ILesson.CreateApiPayload> = zod.object({
  tutorId: id,
  slotId: id,
  start: datetime,
  duration,
});

const updateLessonPayload: ZodSchema<ILesson.UpdateApiPayload> = zod.object({
  lessonId: id,
  slotId: id,
  start: datetime,
  duration: duration,
});

const findLessonsQuery: ZodSchema<ILesson.FindLessonsApiQuery> = zod.object({
  users: zod.optional(zod.array(id)),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
  ratified: zod.optional(jsonBoolean),
  canceled: zod.optional(jsonBoolean),
  reported: zod.optional(jsonBoolean),
  future: zod.optional(jsonBoolean),
  past: zod.optional(jsonBoolean),
  now: zod.optional(jsonBoolean),
  after: zod.optional(zod.string().datetime()),
  before: zod.optional(zod.string().datetime()),
  full: zod.optional(jsonBoolean),
});

const findAttendedLessonsStatsQuery = zod.object({
  after: zod.string().datetime(),
  before: zod.string().datetime(),
});

const createWithCardPayload: ZodSchema<ILesson.CreateWithCardApiPayload> =
  createLessonPayload.and(
    zod.object({
      cardToken: zod.string(),
      cvv: zod.string().length(3),
      phone: zod.string().optional(),
    })
  );

const createWithFawryRefNumPayload: ZodSchema<ILesson.CreateWithFawryRefNumApiPayload> =
  createLessonPayload.and(zod.object({ phone: zod.string().optional() }));

const createWithEWalletPayload: ZodSchema<ILesson.CreateWithEWalletApiPayload> =
  createLessonPayload.and(zod.object({ phone: zod.string().optional() }));

async function createWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const payload = createWithCardPayload.parse(req.body);
  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const scaledAmount = calculateLessonPrice(
    platformConfig.totalHourRate,
    payload.duration
  );
  const unscaledAmount = price.unscale(scaledAmount);
  const transaction = await createPaidLessonTx({
    userId: user.id,
    scaledAmount,
    tutorId: payload.tutorId,
    slotId: payload.slotId,
    start: payload.start,
    duration: payload.duration,
    paymentMethod: ITransaction.PaymentMethod.Card,
  });

  const result = await performPayWithCardTx({
    user,
    phone,
    transaction,
    unscaledAmount,
    cvv: payload.cvv,
    cardToken: payload.cardToken,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: ILesson.CreateWithCardApiResponse = {
    transactionId: transaction.id,
    redirectUrl: result.redirectUrl,
  };

  res.status(200).json(response);
}

async function createWithFawryRefNum(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const payload = createWithFawryRefNumPayload.parse(req.body);
  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const scaledAmount = calculateLessonPrice(
    platformConfig.totalHourRate,
    payload.duration
  );
  const unscaledAmount = price.unscale(scaledAmount);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    scaledAmount,
    tutorId: payload.tutorId,
    slotId: payload.slotId,
    start: payload.start,
    duration: payload.duration,
    paymentMethod: ITransaction.PaymentMethod.Fawry,
  });

  const result = await performPayWithEWalletTx({
    user,
    phone,
    transaction,
    unscaledAmount,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: ILesson.CreateWithFawryRefNumApiResponse = {
    transactionId: transaction.id,
    referenceNumber: Number(result.referenceNumber),
  };

  res.status(200).json(response);
}

async function createWithEWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const payload = createWithEWalletPayload.parse(req.body);
  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  const scaledAmount = calculateLessonPrice(
    platformConfig.totalHourRate,
    payload.duration
  );
  const unscaledAmount = price.unscale(scaledAmount);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    scaledAmount,
    tutorId: payload.tutorId,
    slotId: payload.slotId,
    start: payload.start,
    duration: payload.duration,
    paymentMethod: ITransaction.PaymentMethod.EWallet,
  });

  const result = await performPayWithEWalletTx({
    user,
    phone,
    transaction,
    unscaledAmount,
  });

  if (result instanceof FawryError) return next(fawryError(result.message));

  const response: ILesson.CreateWithEWalletApiResponse = {
    transactionId: transaction.id,
    referenceNumber: result.referenceNumber,
    walletQr: result.walletQr,
  };

  res.status(200).json(response);
}

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

      // lesson should be in the future
      if (dayjs.utc(payload.start).isBefore(dayjs.utc())) return next(bad());

      const sub =
        (await subscriptions
          .find({
            users: [user.id],
            terminated: false,
            end: { after: dayjs.utc().toISOString() },
          })
          .then(({ list }) => first(list))) ||
        generateFreeSubscription({
          userId: user.id,
          userCreatedAt: user.createdAt,
        });

      const remainingMinutes =
        await calcRemainingWeeklyMinutesBySubscription(sub);

      if (remainingMinutes < payload.duration) return next(noEnoughMinutes());

      // subscribed users should not be able to book lessons not within the
      // current week
      const weekBoundaries = isPseudoSubscription(sub)
        ? getPseudoWeekBoundaries()
        : getCurrentWeekBoundaries(sub.start);
      const within = dayjs
        .utc(payload.start)
        .add(payload.duration, "minutes")
        .isBetween(weekBoundaries.start, weekBoundaries.end, "minutes", "[]");
      if (!within) return next(weekBoundariesViolation());

      const price = isTutorManager(tutor)
        ? 0
        : calculateLessonPrice(
            platformConfig.tutorHourlyRate,
            payload.duration
          );

      // Check if the new lessons intercepts any of current subslots
      if (
        !(await isBookable({
          slot,
          bookInfo: {
            start: payload.start,
            duration: payload.duration,
          },
        }))
      )
        return next(busyTutor());

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

      if (tutor.phone && tutor.notificationMethod)
        sendMsg({
          to: tutor.phone,
          template: {
            name: "new_lesson_booked",
            parameters: {
              duration: lesson.duration,
              date: dayjs(lesson.start)
                .tz(AFRICA_CAIRO_TIMEZONE)
                .format("ddd D MMM hh:mm A"),
            },
          },
          method: tutor.notificationMethod,
        });

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
      if (
        slot.purpose !== IAvailabilitySlot.Purpose.General &&
        slot.purpose !== IAvailabilitySlot.Purpose.Lesson
      )
        return next(illegal());

      if (
        !(await isBookable({
          slot,
          bookInfo: {
            start: payload.start || lesson.start,
            duration: payload.duration || lesson.duration,
          },
        }))
      )
        return next(busyTutor());

      const updated = await lessons.update(payload.lessonId, {
        start: payload.start,
        duration: payload.duration,
        slotId: payload.slotId,
      });

      res.sendStatus(200);

      // Notify the other member that the lesson is canceled
      const otherMember = members.find((member) => member.userId !== user.id);
      if (!otherMember) return;

      if (otherMember.phone && otherMember.notificationMethod)
        sendMsg({
          to: otherMember.phone,
          template: {
            name: "lesson_updated",
            parameters: {
              predate: dayjs(lesson.start)
                .tz(AFRICA_CAIRO_TIMEZONE)
                .format("ddd D MMM hh:mm A"),
              curdate: dayjs(updated.start)
                .tz(AFRICA_CAIRO_TIMEZONE)
                .format("ddd D MMM hh:mm A"),
            },
          },
          method: otherMember.notificationMethod,
        });

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

async function findAttendedLessonsStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { after, before }: ILesson.FindAttendedLessonsStatsApiQuery =
    findAttendedLessonsStatsQuery.parse(req.query);
  const allowed = isAdmin(user);
  if (!allowed) return next(forbidden());

  if (dayjs(after).isAfter(before)) return next(bad());

  const { list } = await lessons.find({
    after: dayjs(after).startOf("day").toISOString(),
    before: dayjs(before).startOf("day").toISOString(),
  });

  const map = getDayLessonsMap(list);
  const result: ILesson.FindAttendedLessonsStatsApiResponse =
    inflateDayLessonsMap(map);
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
    members: await withImageUrls(
      members.map((member) => ({
        ...member,
        // mask private information
        phone: null,
        verifiedPhone: false,
      }))
    ),
  };

  res.status(200).json(response);
}

async function cancel(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { lessonId } = withNamedId("lessonId").parse(req.params);
  const lesson = await lessons.findById(lessonId);
  if (!lesson) return next(notfound.lesson());

  if (dayjs(lesson.start).add(lesson.duration, "minutes").isBefore(dayjs()))
    return next(lessonTimePassed());

  if (dayjs(lesson.start).isBefore(dayjs()))
    return next(lessonAlreadyStarted());

  const members = await lessons.findLessonMembers([lessonId]);
  const member = members.map((member) => member.userId).includes(user.id);
  if (!member) return next(forbidden());

  await lessons.cancel({
    canceledBy: user.id,
    ids: [lessonId],
  });

  res.status(200).send();

  // Notify the other member that the lesson is canceled
  const otherMember = members.find((member) => member.userId !== user.id);
  if (!otherMember) return;

  if (otherMember.phone && otherMember.notificationMethod)
    sendMsg({
      to: otherMember.phone,
      template: {
        name: "lesson_canceled",
        parameters: {
          date: dayjs(lesson.start)
            .tz(AFRICA_CAIRO_TIMEZONE)
            .format("ddd D MMM hh:mm A"),
        },
      },
      method: otherMember.notificationMethod,
    });
}

async function report(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const { lessonId } = withNamedId("lessonId").parse(req.params);
  const lesson = await lessons.findById(lessonId);
  if (!lesson) return next(notfound.lesson());

  if (dayjs(lesson.start).add(lesson.duration, "minutes").isBefore(dayjs()))
    return next(lessonTimePassed());

  if (dayjs(lesson.start).isAfter(dayjs())) return next(lessonNotStarted());

  // TODO: include error waitForTutor

  const members = await lessons.findLessonMembers([lessonId]);
  const member = members.map((member) => member.userId).includes(user.id);
  if (!member) return next(forbidden());

  await lessons.report({ ids: [lessonId] });

  res.status(200).send();
}

export default {
  create,
  update,
  cancel: safeRequest(cancel),
  report: safeRequest(report),
  findLessons: safeRequest(findLessons),
  findLessonById: safeRequest(findLessonById),
  findAttendedLessonsStats: safeRequest(findAttendedLessonsStats),
  createWithCard: safeRequest(createWithCard),
  createWithFawrRefNum: safeRequest(createWithFawryRefNum),
  createWithEWallet: safeRequest(createWithEWallet),
};
