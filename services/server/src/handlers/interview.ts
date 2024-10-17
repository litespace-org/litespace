import { badRequest, forbidden, notfound, unexpected } from "@/lib/error";
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
  boolean,
  datetime,
  id,
  interviewStatus,
  number,
  pagination,
  string,
  withNamedId,
} from "@/validation/utils";
import { Element, IInterview, IUser } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";
import { isAdmin, isInterviewer, isTutor } from "@litespace/auth";
import { isEmpty, isUndefined } from "lodash";
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
  sign: zod.optional(boolean),
});

const findInterviewsQuery = zod.object({ user: zod.optional(id) });

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
  if (!isInterviewer(interviewer)) return next(badRequest());

  const list = await interviews.findByInterviewee(intervieweeId);
  const interviewable = canBeInterviewed(list);
  if (!interviewable) return next(badRequest());

  const rule = await rules.findById(ruleId);
  if (!rule) return next(notfound.base());

  const ruleCalls = await calls.findByRuleId({
    rule: rule.id,
    canceled: false, // ignore canceled calls
  });

  const canBookInterview = canBook({
    rule,
    calls: ruleCalls,
    call: { start, duration: INTERVIEW_DURATION },
  });
  if (!canBookInterview) return next(badRequest());

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
  const currentUser = req.user;
  const { user } = findInterviewsQuery.parse(req.query);
  const owner = isTutor(currentUser) && currentUser.id === user;
  const allowed = owner || isAdmin(currentUser) || isInterviewer(currentUser);
  if (!allowed) return next(forbidden());

  const { page, size } = pagination.parse(req.query);
  const { interviews: userInterviews, total } = await interviews.find({
    users: user ? [user] : undefined,
    page,
    size,
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
  if (!interview) return next(notfound.base());

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
  const allowed = isAdmin(user) || isInterviewer(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const payload: IInterview.UpdateApiPayload = updateInterviewPayload.parse(
    req.body
  );
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.base());

  if (
    (isTutor(user) && user.id !== interview.ids.interviewee) ||
    (isInterviewer(user) && user.id !== interview.ids.interviewer)
  )
    return next(forbidden());

  // Tutor can only update the feedback of the interview
  const isPermissionedInterviewee =
    user.role === IUser.Role.Tutor &&
    !isUndefined(payload.feedback?.interviewee);

  const isPermissionedInterviewer =
    user.role === IUser.Role.Interviewer &&
    (!isUndefined(payload.feedback?.interviewer) ||
      !isUndefined(payload.note) ||
      !isUndefined(payload.level) ||
      !isUndefined(payload.status));

  const isPermissionedAdmin =
    user.role === IUser.Role.SuperAdmin && !isUndefined(payload.sign);

  const isPermissioned =
    isPermissionedInterviewee ||
    isPermissionedInterviewer ||
    isPermissionedAdmin;
  if (!isPermissioned) return next(forbidden());

  //! temp: sign by the interviewer for now
  const signer =
    payload.status === IInterview.Status.Passed ? user.id : undefined;
  // payload.sign === true // sign
  //   ? req.user.id
  //   : payload.sign === false // unsign
  //   ? null
  //   : undefined; // no-update

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
