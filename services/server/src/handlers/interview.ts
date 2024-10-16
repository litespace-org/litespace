import { badRequest, forbidden, notfound, unexpected } from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import { enforceRequest } from "@/middleware/accessControl";
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
import asyncHandler from "express-async-handler";
import zod from "zod";
import { authorizer } from "@litespace/auth";
import { isEmpty, isUndefined } from "lodash";

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

async function createInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const intervieweeId = req.user.id;
  const { interviewerId, start, ruleId }: IInterview.CreateApiPayload =
    createInterviewPayload.parse(req.body);

  const interviewer = await users.findById(interviewerId);
  if (!interviewer) return next(notfound.user());

  const list = await interviews.findByInterviewee(intervieweeId);
  const interviewable = canBeInterviewed(list);
  if (!interviewable) return next(badRequest());

  const rule = await rules.findById(ruleId);
  if (!rule) return next(notfound.base());

  // const bookedCalls = await calls.findBySlotId(call.ruleId);
  // const enough = hasEnoughTime({
  //   call: { start: call.start, duration: INTERVIEW_DURATION },
  //   calls: bookedCalls,
  //   slot,
  // });
  // if (!enough) return next(badRequest());

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
  const allowed = authorizer().admin().tutor().interviewer().check(req.user);
  if (!allowed) return next(forbidden());

  const { userId } = withNamedId("userId").parse(req.params);
  const query = pagination.parse(req.query);
  const { interviews: userInterviews, total } = await interviews.findByUser(
    userId,
    query
  );
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
  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.base());

  const allowed = enforceRequest(
    req,
    [interview.ids.interviewer, interview.ids.interviewee].includes(
      req.user?.id
    )
  );
  if (!allowed) return next(forbidden());

  res.status(200).json(interview);
}

async function updateInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowed = authorizer()
    .superAdmin()
    .interviewer()
    .tutor()
    .check(req.user);
  if (!allowed) return next(forbidden());

  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const payload: IInterview.UpdateApiPayload = updateInterviewPayload.parse(
    req.body
  );
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.base());

  const eligible = authorizer()
    .member(interview.ids.interviewer, interview.ids.interviewee)
    .superAdmin()
    .check(req.user);
  if (!eligible) return next(forbidden());

  // Tutor can only update the feedback of the interview
  const isPermissionedInterviewee =
    req.user.role === IUser.Role.Tutor &&
    !isUndefined(payload.feedback?.interviewee);

  const isPermissionedInterviewer =
    req.user.role === IUser.Role.Interviewer &&
    (!isUndefined(payload.feedback?.interviewer) ||
      !isUndefined(payload.note) ||
      !isUndefined(payload.level) ||
      !isUndefined(payload.status));

  const isPermissionedAdmin =
    req.user.role === IUser.Role.SuperAdmin && !isUndefined(payload.sign);

  const isPermissioned =
    isPermissionedInterviewee ||
    isPermissionedInterviewer ||
    isPermissionedAdmin;
  if (!isPermissioned) return next(forbidden());

  //! temp: sign by the interviewer for now
  const signer =
    payload.status === IInterview.Status.Passed ? req.user.id : undefined;
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
  createInterview: asyncHandler(createInterview),
  findInterviews: asyncHandler(findInterviews),
  updateInterview: asyncHandler(updateInterview),
  findInterviewById: asyncHandler(findInterviewById),
};
