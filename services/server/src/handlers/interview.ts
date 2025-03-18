import {
  bad,
  busyTutorManager,
  forbidden,
  interviewAlreadySigned,
  notfound,
} from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import {
  interviews,
  users,
  knex,
  rooms,
  availabilitySlots,
  lessons,
} from "@litespace/models";
import {
  datetime,
  id,
  ids,
  interviewStatus,
  jsonBoolean,
  number,
  pageNumber,
  pageSize,
  string,
  withNamedId,
} from "@/validation/utils";
import { IInterview } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";
import {
  isAdmin,
  isTutorManager,
  isSuperAdmin,
  isTutor,
  isRegularTutor,
} from "@litespace/utils/user";
import { concat, isEqual } from "lodash";
import {
  asSubSlots,
  canBook,
  genSessionId,
  INTERVIEW_DURATION,
} from "@litespace/utils";

const createInterviewPayload = zod.object({
  interviewerId: id,
  start: datetime,
  slotId: id,
});

const updateInterviewPayload = zod.object({
  feedback: zod.optional(
    zod.object({
      interviewer: zod.optional(string),
      interviewee: zod.optional(string),
    })
  ),
  interviewerNote: zod.optional(string),
  score: zod.optional(number),
  status: zod.optional(interviewStatus),
  sign: zod.optional(zod.literal(true)),
});

const findInterviewsQuery = zod.object({
  users: zod.optional(ids),
  statuses: zod.optional(zod.array(interviewStatus)),
  levels: zod.optional(zod.array(zod.coerce.number().int().positive())),
  signed: zod.optional(jsonBoolean),
  meta: zod.optional(jsonBoolean),
  signers: zod.optional(ids),
  page: zod.optional(pageNumber),
  size: zod.optional(pageSize),
});

async function createInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const intervieweeId = user.id;
  const { interviewerId, start, slotId }: IInterview.CreateApiPayload =
    createInterviewPayload.parse(req.body);

  const interviewer = await users.findById(interviewerId);
  if (!interviewer) return next(notfound.user());
  if (!isTutorManager(interviewer)) return next(bad());

  const list = await interviews.findByInterviewee(intervieweeId);
  const interviewable = canBeInterviewed(list);
  if (!interviewable) return next(bad());

  const slot = await availabilitySlots.findById(slotId);
  if (!slot) return next(notfound.slot());

  const slotLessons = await lessons.find({
    slots: [slotId],
    full: true,
    canceled: false, // ignore canceled lessons
  });

  const slotInterviews = await interviews.findBySlotId(slotId);

  const canBookInterview = canBook({
    bookedSubslots: concat(
      asSubSlots(slotLessons.list),
      asSubSlots(slotInterviews)
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

  const interview = await knex.transaction(async (tx) => {
    if (!room) await rooms.create(members, tx);

    const interview = await interviews.create({
      interviewer: interviewerId,
      interviewee: intervieweeId,
      session: genSessionId("interview"),
      slot: slot.id,
      start,
      tx,
    });

    return interview;
  });

  const response: IInterview.CreateInterviewApiResponse = interview;

  res.status(200).json(response);
}

async function findInterviews(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const query: IInterview.FindInterviewsApiQuery = findInterviewsQuery.parse(
    req.query
  );
  const owner = isTutor(user) && isEqual(query.users, [user.id]);
  const allowed = owner || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list: userInterviews, total } = await interviews.find({
    users: query.users,
    meta: query.meta,
    statuses: query.statuses,
    levels: query.levels,
    signed: query.signed,
    signers: query.signers,
    page: query.page,
    size: query.size,
  });

  const result: IInterview.FindInterviewsApiResponse = {
    list: userInterviews,
    total,
  };

  res.status(200).json(result);
}

async function findInterviewById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isTutor(user) || isAdmin(user) || isTutorManager(user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.interview());

  if (
    (isRegularTutor(user) && user.id !== interview.ids.interviewee) ||
    (isTutorManager(user) && user.id !== interview.ids.interviewer)
  )
    return next(forbidden());

  res.status(200).json(interview);
}

async function updateInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed =
    isSuperAdmin(user) || isTutorManager(user) || isRegularTutor(user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const payload: IInterview.UpdateApiPayload = updateInterviewPayload.parse(
    req.body
  );
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.interview());

  if (
    (isRegularTutor(user) && user.id !== interview.ids.interviewee) ||
    (isTutorManager(user) && user.id !== interview.ids.interviewer)
  )
    return next(forbidden());

  // Tutor can only update the feedback of the interview
  const isPermissionedInterviewee =
    isRegularTutor(user) && !payload.feedback?.interviewee;

  const isPermissionedInterviewer =
    isTutorManager(user) &&
    (!payload.feedback?.interviewer ||
      !payload.note ||
      !payload.level ||
      !payload.status);

  const isPermissionedAdmin = isSuperAdmin(user) && payload.sign === true;

  const isPermissioned =
    isPermissionedInterviewee ||
    isPermissionedInterviewer ||
    isPermissionedAdmin;
  if (!isPermissioned) return next(forbidden());

  if (payload.sign && interview.signer) return next(interviewAlreadySigned());

  const signer = payload.sign ? user.id : undefined;
  const updated = await interviews.update(interviewId, {
    feedback: payload.feedback,
    note: payload.note,
    level: payload.level,
    status: payload.status,
    signer,
  });
  res.status(200).json(updated);
}

export default {
  createInterview: safeRequest(createInterview),
  findInterviews: safeRequest(findInterviews),
  updateInterview: safeRequest(updateInterview),
  findInterviewById: safeRequest(findInterviewById),
};
