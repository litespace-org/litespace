import {
  bad,
  busyTutorManager,
  conflictingInterview,
  empty,
  forbidden,
  notfound,
  unexpected,
} from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import {
  interviews,
  knex,
  rooms,
  availabilitySlots,
  lessons,
  tutors,
  users,
} from "@litespace/models";
import {
  dateFilter,
  datetime,
  id,
  ids,
  nullableString,
  pageNumber,
  pageSize,
  sessionId,
} from "@/validation/utils";
import { IInterview, IUser, IAvailabilitySlot } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod, { ZodSchema } from "zod";
import {
  isAdmin,
  isTutorManager,
  isTutor,
  isRegularTutor,
} from "@litespace/utils/user";
import { concat, first, groupBy, sample } from "lodash";
import {
  AFRICA_CAIRO_TIMEZONE,
  asSubSlots,
  canBook,
  destructureInterviewStatus,
  genSessionId,
  getFirstAvailableSlot,
  INTERVIEW_DURATION,
} from "@litespace/utils";
import { sendNotificationMessage } from "@/lib/kafka";
import dayjs from "dayjs";
import { withImageUrl, withImageUrls } from "@/lib/user";

const createPayload: ZodSchema<IInterview.CreateApiPayload> = zod.object({
  start: datetime,
  slotId: id,
});

const findQuery: ZodSchema<IInterview.FindApiQuery> = zod.object({
  ids: ids.describe("filter by interview id").optional(),
  userss: ids.describe("filter by user ids").optional(),
  interviewers: ids.describe("filter by interviewer ids").optional(),
  interviewees: ids.describe("filter by interviewee ids").optional(),
  interviewerFeedback: nullableString
    .describe("filter by interviewer feedback")
    .optional(),
  intervieweeFeedback: nullableString
    .describe("filter by the interviewee feedback")
    .optional(),
  slots: ids.describe("filter by slot ids").optional(),
  sessions: sessionId.array().describe("filter by session ids").optional(),
  statuses: zod
    .nativeEnum(IInterview.Status)
    .array()
    .describe("filter by interview statuses")
    .optional(),
  start: dateFilter.describe("filter by interview start time").optional(),
  end: dateFilter.describe("filter by interview end time").optional(),
  createdAt: dateFilter
    .describe("filter by the interview creation date")
    .optional(),
  page: pageNumber.optional(),
  size: pageSize.optional(),
});

const updatePayload: ZodSchema<IInterview.UpdateApiPayload> = zod.object({
  id,
  interviewerFeedback: zod.string().optional(),
  intervieweeFeedback: zod.string().optional(),

  status: zod.nativeEnum(IInterview.Status).optional(),
});

async function create(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isRegularTutor(user);

  if (!allowed) return next(forbidden());

  const { start, slotId } = createPayload.parse(req.body);

  const slot = await availabilitySlots.findById(slotId);
  if (!slot) return next(notfound.slot());
  if (
    [
      IAvailabilitySlot.Purpose.Interview,
      IAvailabilitySlot.Purpose.General,
    ].includes(slot.purpose) === false
  )
    return next(bad());

  const intervieweeId = user.id;
  const interviewer = await tutors.findById(slot.userId);
  if (!interviewer) return next(notfound.user());
  // only activated tutor managers can accept interviews
  if (!isTutorManager(interviewer) || !interviewer.activated)
    return next(bad());

  const interviewable = await canBeInterviewed(intervieweeId);
  if (!interviewable) return next(conflictingInterview());

  const slotLessons = await lessons.find({
    slots: [slotId],
    full: true,
    canceled: false, // ignore canceled lessons
  });

  const slotInterviews = await interviews.find({
    slots: [slotId],
    full: true,
    canceled: false,
  });

  const canBookInterview = canBook({
    bookedSubslots: concat(
      asSubSlots(slotLessons.list),
      asSubSlots(slotInterviews.list)
    ),
    slot: slot,
    bookInfo: {
      start: start,
      duration: INTERVIEW_DURATION,
    },
  });
  if (!canBookInterview) return next(busyTutorManager());

  const members = [interviewer.id, intervieweeId];
  const room = await rooms.findRoomByMembers(members);

  await knex.transaction(async (tx) => {
    if (!room) await rooms.create(members, tx);

    const interview = await interviews.create({
      interviewerId: interviewer.id,
      intervieweeId,
      session: genSessionId("interview"),
      slot: slot.id,
      start,
      tx,
    });

    return interview;
  });

  // notify the tutor manager that an interview was booked with him
  if (interviewer.notificationMethod && interviewer.phone) {
    const date = dayjs(start)
      .tz(AFRICA_CAIRO_TIMEZONE)
      .format("ddd D MMM hh:mm A");
    const expiresAt = dayjs.utc(start).toISOString();

    await sendNotificationMessage({
      method: interviewer.notificationMethod,
      phone: interviewer.phone,
      expiresAt,
      message: `A new interview has be booked at ${date}`,
    });
  }

  res.sendStatus(200);
}

async function find(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const {
    users: userIds,
    interviewers,
    interviewees,
    interviewerFeedback,
    intervieweeFeedback,
    slots,
    sessions,
    statuses,
    createdAt,
    start,
    end,
    page,
    size,
  }: IInterview.FindApiQuery = findQuery.parse(req.query);

  const result = await interviews.find({
    // incase of a regular tutor or tutor manager we should retrict the query
    // result to just their ids otherwise they will access data they are not
    // allowed to see. This done by overriding these query.
    users: isTutor(user) ? [user.id] : userIds,
    interviewers,
    interviewees,
    interviewerFeedback,
    intervieweeFeedback,
    slots,
    sessions,
    statuses,
    createdAt,
    start,
    end,
    page,
    size,
  });

  const { list } = await users.find({
    select: ["id", "name", "image", "role"],
    full: true,
  });

  const usersMapById = groupBy(await withImageUrls(list), (user) => user.id);

  const response: IInterview.FindApiResponse = {
    list: result.list.map((interview) => {
      const interviewer = first(usersMapById[interview.interviewerId]);
      const interviewee = first(usersMapById[interview.intervieweeId]);
      if (!interviewer || !interviewee)
        throw new Error("user not found, should never happen");
      return {
        ...interview,
        interviewer,
        interviewee,
      };
    }),
    total: result.total,
  };

  res.status(200).json(response);
}

async function update(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isTutor(user) || isAdmin(user);
  if (!allowed) return next(forbidden());

  const {
    id,
    intervieweeFeedback,
    interviewerFeedback,
    status,
  }: IInterview.UpdateApiPayload = updatePayload.parse(req.body);

  const interview = await interviews.findOne({ ids: [id] });
  if (!interview) return next(notfound.interview());
  const interviewStatus = destructureInterviewStatus(interview.status);

  // verify membership
  if (
    (isRegularTutor(user) && user.id !== interview.intervieweeId) ||
    (isTutorManager(user) && user.id !== interview.interviewerId)
  )
    return next(forbidden());

  // regular tutors must provide at least one of two fileds: feedback or status
  if (
    isRegularTutor(user) &&
    intervieweeFeedback === undefined &&
    status === undefined
  )
    return next(empty());

  // regular tutors can only update the status to `CanceledByInterviewee`. No
  // other status is allowed.
  if (
    isRegularTutor(user) &&
    status !== undefined &&
    status !== IInterview.Status.CanceledByInterviewee
  )
    return next(bad());

  // regular tutors can no longer update the interview incase it was canceled.
  if (
    isRegularTutor(user) &&
    (interviewStatus.canceledByInterviewee ||
      interviewStatus.canceledByInterviewer)
  )
    return next(bad());

  // once the tutor is accepted or rejected, he can no longer update the status
  // (aka cancel the interview!). He can only provide the feedback.
  if (
    isRegularTutor(user) &&
    (interviewStatus.rejected || interviewStatus.passed) &&
    (status !== undefined || intervieweeFeedback === undefined)
  )
    return next(bad());

  // regular tutors are not allowed to update the interviewer feedback
  if (isRegularTutor(user) && interviewerFeedback !== undefined)
    return next(forbidden());

  // regular tutors cannot provide feedback incase the interview is canceled or
  // still in the pending status.
  if (
    isRegularTutor(user) &&
    (interviewStatus.pending || interviewStatus.canceled) &&
    intervieweeFeedback !== undefined
  )
    return next(bad());

  // tutor managers must provide at least one of two fileds: feedback or status
  if (
    isTutorManager(user) &&
    (interviewerFeedback === undefined || status === undefined)
  )
    return next(empty());

  // tutor managers are not allowed to update the interviewee feedback
  if (isTutorManager(user) && intervieweeFeedback !== undefined)
    return next(forbidden());

  await interviews.update({
    id,
    status,
    intervieweeFeedback,
    interviewerFeedback,
  });

  res.sendStatus(200);
}

async function selectInterviewer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const interviewable = canBeInterviewed(user.id);
  if (!interviewable) return next(bad());

  const now = dayjs().toISOString();

  // 1. retrieve all active tutor managers
  const { list: tutorManagers } = await tutors.find({
    role: [IUser.Role.TutorManager],
    activated: true,
    full: true,
  });

  // 2. retrieve all slots with the purpose "interview" or "general"
  const { list: slotsList } = await availabilitySlots.find({
    users: tutorManagers.map((tutor) => tutor.id),
    after: now,
    full: true,
    deleted: false,
    purposes: [
      IAvailabilitySlot.Purpose.Interview,
      IAvailabilitySlot.Purpose.General,
    ],
  });

  // 3. retrieve all lessons or interviews associated with these slots.
  const { list: interviewsList } = await interviews.find({
    slots: slotsList.map((slot) => slot.id),
    createdAt: { gt: now },
    statuses: [IInterview.Status.Pending],
    full: true,
  });

  const { list: lessonsList } = await lessons.find({
    slots: slotsList.map((slot) => slot.id),
    after: now,
    canceled: false,
    full: true,
  });

  // 4. unpack all slots using its lessons and interviews
  const firstFreeSlot = getFirstAvailableSlot({
    slots: slotsList,
    subslots: [...asSubSlots(interviewsList), ...asSubSlots(lessonsList)],
  });

  // 5. find the first available slot
  const selectedSlot = slotsList.find(
    (slot) => slot.id === firstFreeSlot?.parent
  );

  // 6. select its owner as the interviewer
  const interviewer = tutorManagers.find(
    (tutor) => tutor.id === selectedSlot?.userId
  );

  // 7. select a random tutor manager as a fallback in case the selection logic failed
  const selected = interviewer || sample(tutorManagers);

  if (!selected) return next(unexpected());

  const response: IInterview.SelectInterviewerApiResponse = await withImageUrl({
    id: selected.id,
    name: selected.name,
    image: selected.image,
  });

  res.status(200).json(response);
}

export default {
  create: safeRequest(create),
  find: safeRequest(find),
  update: safeRequest(update),
  selectInterviewer: safeRequest(selectInterviewer),
};
