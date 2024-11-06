import {
  bad,
  busyTutorManager,
  forbidden,
  interviewAlreadySigned,
  notfound,
  unexpected,
} from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import {
  calls,
  interviews,
  rules,
  users,
  knex,
  rooms,
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
import { Element, IInterview } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";
import { isAdmin, isInterviewer, isSuperAdmin, isTutor } from "@litespace/auth";
import { isEmpty, isEqual } from "lodash";
import { canBook } from "@/lib/call";

const INTERVIEW_DURATION = 30;

const createInterviewPayload = zod.object({
  interviewerId: id,
  start: datetime,
  ruleId: id,
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
  levels: zod.optional(zod.array(zod.number().int().positive())),
  signed: zod.optional(jsonBoolean),
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
  const allowed = isTutor(user);
  if (!allowed) return next(forbidden());

  const intervieweeId = user.id;
  const { interviewerId, start, ruleId }: IInterview.CreateApiPayload =
    createInterviewPayload.parse(req.body);

  const interviewer = await users.findById(interviewerId);
  if (!interviewer) return next(notfound.user());
  if (!isInterviewer(interviewer)) return next(bad());

  const list = await interviews.findByInterviewee(intervieweeId);
  const interviewable = canBeInterviewed(list);
  if (!interviewable) return next(bad());

  const rule = await rules.findById(ruleId);
  if (!rule) return next(notfound.rule());

  const ruleCalls = await calls.findByRuleId({
    rule: rule.id,
    canceled: false, // ignore canceled calls
  });

  const canBookInterview = canBook({
    rule,
    calls: ruleCalls,
    call: { start, duration: INTERVIEW_DURATION },
  });
  if (!canBookInterview) return next(busyTutorManager());

  const members = [interviewer.id, intervieweeId];
  const room = await rooms.findRoomByMembers(members);
  if (!room) await rooms.create(members);

  const [interview, call] = await knex.transaction(async (tx) => {
    const { call } = await calls.create(
      {
        rule: ruleId,
        host: interviewerId,
        members: [intervieweeId],
        start: start,
        duration: INTERVIEW_DURATION,
      },
      tx
    );

    const interview = await interviews.create(
      {
        interviewer: interviewerId,
        interviewee: intervieweeId,
        call: call.id,
      },
      tx
    );

    return [interview, call];
  });

  res.status(200).json({ interview, call });
}

async function findInterviews(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const query: IInterview.FindInterviewsApiQuery = findInterviewsQuery.parse(
    req.query
  );
  const owner =
    (isTutor(user) || isInterviewer(user)) && isEqual(query.users, [user.id]);
  const allowed = owner || isAdmin(user);
  if (!allowed) return next(forbidden());

  const { list: userInterviews, total } = await interviews.find({
    users: query.users,
    statuses: query.statuses,
    levels: query.levels,
    signed: query.signed,
    signers: query.signers,
    page: query.page,
    size: query.size,
  });

  const callIds = userInterviews.map((interview) => interview.ids.call);
  const [interviewCalls, callMembers] = await Promise.all([
    calls.findByIds(callIds),
    calls.findCallMembers(callIds),
  ]);

  const result: IInterview.FindInterviewsApiResponse = {
    list: userInterviews.map(
      (interview): Element<IInterview.FindInterviewsApiResponse["list"]> => {
        const call = interviewCalls.find(
          (call) => call.id === interview.ids.call
        );

        const members = callMembers.filter(
          (member) => member.callId === interview.ids.call
        );

        if (!call || isEmpty(members)) throw unexpected();
        return { interview, call, members };
      }
    ),
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
  const allowed = isTutor(user) || isAdmin(user) || isInterviewer(user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.interview());

  if (
    (isTutor(user) && user.id !== interview.ids.interviewee) ||
    (isInterviewer(user) && user.id !== interview.ids.interviewer)
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
  const allowed = isSuperAdmin(user) || isInterviewer(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const payload: IInterview.UpdateApiPayload = updateInterviewPayload.parse(
    req.body
  );
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.interview());

  if (
    (isTutor(user) && user.id !== interview.ids.interviewee) ||
    (isInterviewer(user) && user.id !== interview.ids.interviewer)
  )
    return next(forbidden());

  // Tutor can only update the feedback of the interview
  const isPermissionedInterviewee =
    isTutor(user) && !payload.feedback?.interviewee;

  const isPermissionedInterviewer =
    isInterviewer(user) &&
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
