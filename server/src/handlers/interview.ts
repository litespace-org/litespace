import { badRequest, forbidden, notfound } from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import { enforceRequest } from "@/middleware/accessControl";
import { calls, interviews, rules, users, knex } from "@litespace/models";
import {
  boolean,
  datetime,
  id,
  number,
  string,
  withNamedId,
} from "@/validation/utils";
import { IInterview } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";

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
  passed: zod.optional(boolean),
  approved: zod.optional(boolean),
  approvedBy: zod.optional(id),
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

  const [interview, call] = await knex.transaction(async (tx) => {
    const { call } = await calls.create(
      {
        ruleId,
        hostId: interviewerId,
        memberIds: [intervieweeId],
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
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());
  const { userId } = withNamedId("userId").parse(req.params);
  const list = await interviews.findByUser(userId);
  res.status(200).json(list);
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
  const { interviewId } = withNamedId("interviewId").parse(req.params);
  const payload: IInterview.UpdatePayload = updateInterviewPayload.parse(
    req.body
  );
  const interview = await interviews.findById(interviewId);
  if (!interview) return next(notfound.base());

  const allowed = enforceRequest(
    req,
    [interview.ids.interviewer, interview.ids.interviewee].includes(
      req.user?.id
    )
  );
  if (!allowed) return next(forbidden());

  const updated = await interviews.update(interviewId, payload);
  res.status(200).json(updated);
}

export default {
  createInterview: asyncHandler(createInterview),
  findInterviews: asyncHandler(findInterviews),
  updateInterview: asyncHandler(updateInterview),
  findInterviewById: asyncHandler(findInterviewById),
};
