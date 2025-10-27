import { NextFunction, Request, Response } from "express";
import zod, { ZodSchema } from "zod";
import {
  datetime,
  duration,
  id,
  jsonBoolean,
  boolean,
  pageNumber,
  pageSize,
  pseudoId,
  sessionId,
  unionOfLiterals,
  url,
  withNamedId,
} from "@/validation/utils";
import {
  bad,
  busyTutor,
  forbidden,
  notfound,
  illegal,
  lessonTimePassed,
  lessonAlreadyStarted,
  lessonNotStarted,
  fawryError,
  unexpected,
  noEnoughMinutes,
  weekBoundariesViolation,
  phoneRequired,
} from "@/lib/error/api";
import {
  IAvailabilitySlot,
  IFawry,
  ILesson,
  ITransaction,
  Wss,
} from "@litespace/types";
import {
  lessons,
  knex,
  availabilitySlots,
  transactions,
} from "@litespace/models";
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
import { MAX_FULL_FLAG_DAYS } from "@/constants";
import { groupBy, isEmpty, isEqual } from "lodash";
import {
  AFRICA_CAIRO_TIMEZONE,
  price,
  safePromise,
  UNCANCELLABLE_LESSON_HOURS,
} from "@litespace/utils";
import { withImageUrls, withPhone } from "@/lib/user";
import dayjs from "@/lib/dayjs";
import {
  createLesson,
  getDayLessonsMap,
  inflateDayLessonsMap,
  checkBookingLessonEligibilityState,
  validateCreateLessonPayload,
} from "@/lib/lesson";
import { getSessionsMp4Files, isBookable } from "@/lib/session";
import { sendMsg } from "@/lib/messenger";
import { createPaidLessonTx } from "@/lib/transaction";
import {
  performPayWithCardTx,
  performPayWithEWalletTx,
  performPayWithFawryRefNumTx,
} from "@/lib/fawry";
import {
  BusyTutor,
  FawryError,
  InvalidLessonStart,
  NoEnoughMinutes,
  SlotNotFound,
  TutorNotFound,
  Unexpected,
  WeekBoundariesViolation,
} from "@/lib/error/local";
import { encodeMerchantRefNumber } from "@/fawry/lib/ids";
import { fawry } from "@/fawry/api";
import { ORDER_STATUS_TO_TRANSACTION_STATUS } from "@/fawry/constants";
import { createPseudoLessonSlot } from "@/lib/availabilitySlot";

const createLessonPayload: ZodSchema<ILesson.CreateApiPayload> = zod.object({
  tutorId: id,
  slotId: id.or(pseudoId),
  start: datetime,
  duration,
});

const updateLessonPayload: ZodSchema<ILesson.UpdateApiPayload> = zod.object({
  lessonId: id,
  slotId: id,
  start: datetime,
  duration,
});

const findBySessionIdQuery: ZodSchema<ILesson.FindBySessionIdApiQuery> =
  zod.object({
    sessionId: sessionId,
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

const checkoutPayload: ZodSchema<ILesson.CheckoutPayload> = zod.object({
  duration,
  tutorId: id,
  slotId: id.or(pseudoId),
  start: datetime,
  returnUrl: url,
  paymentMethod: unionOfLiterals<IFawry.PaymentMethod>([
    "CARD",
    "MWALLET",
    "PAYATFAWRY",
    "Mobile Wallet",
  ]),
  saveCardInfo: boolean.optional(),
  authCaptureModePayment: boolean.optional(),
});

async function createWithCard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const payload = createWithCardPayload.parse(req.body);
  const phone = await withPhone(user, payload.phone);
  if (phone instanceof Error) return next(bad(phone.message));

  if (payload.slotId < 0) {
    const pseudoSlot = await createPseudoLessonSlot({
      tutorId: payload.tutorId,
      duration: payload.duration,
      start: payload.start,
    });
    payload.slotId = pseudoSlot.id;
  }

  const valid = await validateCreateLessonPayload(payload);
  if (valid instanceof TutorNotFound) return next(notfound.tutor());
  if (valid instanceof SlotNotFound) return next(notfound.slot());
  if (valid instanceof InvalidLessonStart) return next(bad());
  if (valid instanceof BusyTutor) return next(busyTutor());

  const amount = calculateLessonPrice(payload.duration);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    amount,
    phone,
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
    amount,
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

  if (payload.slotId < 0) {
    const pseudoSlot = await createPseudoLessonSlot({
      tutorId: payload.tutorId,
      duration: payload.duration,
      start: payload.start,
    });
    payload.slotId = pseudoSlot.id;
  }

  const valid = await validateCreateLessonPayload(payload);
  if (valid instanceof TutorNotFound) return next(notfound.tutor());
  if (valid instanceof SlotNotFound) return next(notfound.slot());
  if (valid instanceof InvalidLessonStart) return next(bad());
  if (valid instanceof BusyTutor) return next(busyTutor());

  const amount = calculateLessonPrice(payload.duration);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    amount,
    phone,
    tutorId: payload.tutorId,
    slotId: payload.slotId,
    start: payload.start,
    duration: payload.duration,
    paymentMethod: ITransaction.PaymentMethod.Fawry,
  });

  const result = await performPayWithFawryRefNumTx({
    user,
    phone,
    transaction,
    amount,
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

  if (payload.slotId < 0) {
    const pseudoSlot = await createPseudoLessonSlot({
      tutorId: payload.tutorId,
      duration: payload.duration,
      start: payload.start,
    });
    payload.slotId = pseudoSlot.id;
  }

  const valid = await validateCreateLessonPayload(payload);
  if (valid instanceof TutorNotFound) return next(notfound.tutor());
  if (valid instanceof SlotNotFound) return next(notfound.slot());
  if (valid instanceof InvalidLessonStart) return next(bad());
  if (valid instanceof BusyTutor) return next(busyTutor());

  const amount = calculateLessonPrice(payload.duration);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    amount,
    phone,
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
    amount,
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

      if (dayjs().isAfter(payload.start)) return next(bad());

      // TODO: remove once the policy changes back
      if (payload.slotId < 0) {
        const pseudoSlot = await createPseudoLessonSlot({
          tutorId: payload.tutorId,
          start: payload.start,
          duration: payload.duration,
        });
        payload.slotId = pseudoSlot.id;
      }

      const state = await checkBookingLessonEligibilityState({
        userId: user.id,
        start: payload.start,
        duration: payload.duration,
      });
      if (state instanceof Unexpected) return next(unexpected(state.message));
      if (state instanceof NoEnoughMinutes) return next(noEnoughMinutes());
      if (state instanceof WeekBoundariesViolation)
        return next(weekBoundariesViolation());
      if (!state.eligible) return next(forbidden());

      const lesson = await knex.transaction((tx) =>
        createLesson({
          userId: user.id,
          tutorId: payload.tutorId,
          slotId: payload.slotId,
          start: payload.start,
          duration: payload.duration,
          txId: state.txId,
          io: context.io,
          tx,
        })
      );

      if (lesson instanceof TutorNotFound) return next(notfound.tutor());
      if (lesson instanceof SlotNotFound) return next(notfound.slot());
      if (lesson instanceof InvalidLessonStart) return next(bad());
      if (lesson instanceof BusyTutor) return next(busyTutor());

      const response: ILesson.CreateLessonApiResponse = lesson;
      res.status(200).json(response);
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

      if (otherMember.phone)
        sendMsg(
          {
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
          },
          true
        );

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
    reported: query.reported,
    after: query.after,
    before: query.before,
    page: query.page,
    size: query.size,
    full: query.full,
  });

  const userLesonsIds = userLessons.map((lesson) => lesson.id);
  const userSessionIds = userLessons.map((lesson) => lesson.sessionId);
  const [lessonMembers, sessionMp4FilesMap] = await Promise.all([
    await withImageUrls(await lessons.findLessonMembers(userLesonsIds)),
    await getSessionsMp4Files(userSessionIds, true),
  ]);
  const lessonMembersMap = groupBy(lessonMembers, (m) => m.lessonId);

  const result: ILesson.FindUserLessonsApiResponse = {
    list: userLessons.map((lesson) => {
      const members = lessonMembersMap[lesson.id] || [];
      const files = sessionMp4FilesMap[lesson.sessionId] || [];
      return {
        lesson,
        members: members.map((member) => ({
          ...member,
          // mask private information
          phone: null,
          verifiedPhone: false,
        })),
        files,
      };
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

async function findRefundableLessons(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  // TODO: add pagination
  const list = await lessons.findRefundable(user.id);

  // Retrieve the last transaction status from fawry.
  // NOTE: fawry doesn't inform us for refunds via the web hook.
  for (const lesson of list) {
    if (!lesson.txId) continue;
    if (lesson.txStatus !== ITransaction.Status.Refunding) continue;

    const merchantRefNumber = encodeMerchantRefNumber({
      transactionId: lesson.txId,
      createdAt: lesson.txCreatedAt,
    });

    const result = await safePromise(fawry.getPaymentStatus(merchantRefNumber));
    if (result instanceof Error) return next(result);

    const status = ORDER_STATUS_TO_TRANSACTION_STATUS[result.orderStatus];

    if (
      status === ITransaction.Status.New ||
      status === ITransaction.Status.Processed ||
      status === ITransaction.Status.Paid
    )
      continue;

    lesson.txStatus = status;
    transactions.update({ id: lesson.txId, status });
  }

  const result: ILesson.FindRefundableLessonsApiResponse = list;

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
  if (!isMember && !isAdmin(user) && !isTutorManager(user))
    return next(forbidden());

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

async function findBySessionId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isAdmin(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findBySessionIdQuery.parse(req.params);

  const lesson = await lessons.findBySessionId(sessionId);
  if (!lesson) return next(bad());

  const members = await lessons.findLessonMembers([lesson.id]);

  const response: ILesson.FindLessonBySessionIdApiResponse = {
    lesson,
    members,
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

  const now = dayjs();

  if (dayjs(lesson.start).add(lesson.duration, "minutes").isBefore(now))
    return next(lessonTimePassed());

  if (dayjs(lesson.start).isBefore(now)) return next(lessonAlreadyStarted());

  if (
    dayjs(lesson.start)
      .subtract(UNCANCELLABLE_LESSON_HOURS, "hours")
      .isBefore(now)
  )
    return next(forbidden());

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

  if (otherMember.phone)
    sendMsg(
      {
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
      },
      true
    );
}

async function report(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user);
  if (!allowed) return next(forbidden());

  const { lessonId } = withNamedId("lessonId").parse(req.params);
  const lesson = await lessons.findById(lessonId);
  if (!lesson) return next(notfound.lesson());

  const now = dayjs();

  if (dayjs(lesson.start).add(lesson.duration, "minutes").isBefore(now))
    return next(lessonTimePassed());

  if (dayjs(lesson.start).isAfter(now)) return next(lessonNotStarted());

  // TODO: include error waitForTutor

  const members = await lessons.findLessonMembers([lessonId]);
  const member = members.map((member) => member.userId).includes(user.id);
  if (!member) return next(forbidden());

  await lessons.report({ ids: [lessonId] });

  res.status(200).send();
}

async function checkout(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isAdmin(user);
  if (!allowed) return next(forbidden());
  if (!user.phone) return next(phoneRequired());

  const payload = checkoutPayload.parse(req.body);

  // TODO: remove once the policy changes back
  if (payload.slotId < 0) {
    const pseudoSlot = await createPseudoLessonSlot({
      tutorId: payload.tutorId,
      start: payload.start,
      duration: payload.duration,
    });
    payload.slotId = pseudoSlot.id;
  }

  const valid = await validateCreateLessonPayload(payload);
  if (valid instanceof TutorNotFound) return next(notfound.tutor());
  if (valid instanceof SlotNotFound) return next(notfound.slot());
  if (valid instanceof InvalidLessonStart) return next(bad());
  if (valid instanceof BusyTutor) return next(busyTutor());

  const amount = calculateLessonPrice(payload.duration);

  const transaction = await createPaidLessonTx({
    userId: user.id,
    amount,
    phone: user.phone,
    tutorId: payload.tutorId,
    slotId: payload.slotId,
    start: payload.start,
    duration: payload.duration,
    paymentMethod: ITransaction.PaymentMethod.Card,
  });

  const result = await fawry.initExpressCheckout({
    merchantRefNum: encodeMerchantRefNumber({
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
    }),
    amount: price.unscale(amount),
    customer: {
      id: user.id,
      name: user.name || "",
      phone: user.phone,
      email: user.email,
    },
    paymentMethod: payload.paymentMethod,
    returnUrl: payload.returnUrl,
    saveCardInfo: payload.saveCardInfo,
    authCaptureModePayment: payload.authCaptureModePayment,
  });
  if (result instanceof Error) return next(result);
  if (typeof result !== "string") return next(unexpected());

  const response: IFawry.InitExpressCheckoutResponse = result;
  res.status(200).json(response);
}

export default {
  create,
  update,
  cancel: safeRequest(cancel),
  report: safeRequest(report),
  findLessons: safeRequest(findLessons),
  findLessonById: safeRequest(findLessonById),
  findBySessionId: safeRequest(findBySessionId),
  findAttendedLessonsStats: safeRequest(findAttendedLessonsStats),
  findRefundableLessons: safeRequest(findRefundableLessons),
  createWithCard: safeRequest(createWithCard),
  createWithFawrRefNum: safeRequest(createWithFawryRefNum),
  createWithEWallet: safeRequest(createWithEWallet),
  checkout: safeRequest(checkout),
};
