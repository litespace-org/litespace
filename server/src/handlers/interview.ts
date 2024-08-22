import { badRequest, forbidden, notfound } from "@/lib/error";
import { canBeInterviewed } from "@/lib/interview";
import { enforceRequest } from "@/middleware/accessControl";
import { calls, interviews, rules, users } from "@/models";
import { knex } from "@/models/query";
import { boolean, datetime, id, number, string } from "@/validation/utils";
import { ICall, IInterview } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import zod from "zod";

const INTERVIEW_DURATION = 30;

const createInterviewPayload = zod.object({
  interviewerId: id,
  call: zod.object({
    start: datetime,
    ruleId: id,
  }),
});

const findInterviewsPayload = zod.object({ userId: id });
const updateInterviewParams = zod.object({ interviewId: id });
const findInterviewByIdParams = zod.object({ interviewId: id });
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
  const { interviewerId, call }: IInterview.CreateApiPayload =
    createInterviewPayload.parse(req.body);

  const interviewer = await users.findById(interviewerId);
  if (!interviewer) return next(notfound.user());

  const list = await interviews.findByInterviewee(intervieweeId);
  const interviewable = canBeInterviewed(list);
  if (!interviewable) return next(badRequest());

  const rule = await rules.findById(call.ruleId);
  if (!rule) return next(notfound.base());

  // const bookedCalls = await calls.findBySlotId(call.ruleId);
  // const enough = hasEnoughTime({
  //   call: { start: call.start, duration: INTERVIEW_DURATION },
  //   calls: bookedCalls,
  //   slot,
  // });
  // if (!enough) return next(badRequest());

  const [interview, interviewCall] = await knex.transaction(async (tx) => {
    const interviewCall = await calls.create(
      {
        hostId: interviewerId,
        attendeeId: intervieweeId,
        duration: INTERVIEW_DURATION,
        ruleId: call.ruleId,
        start: call.start,
        type: ICall.Type.Interview,
      },
      tx
    );

    const interview = await interviews.create(
      {
        interviewer: interviewerId,
        interviewee: intervieweeId,
        call: interviewCall.id,
      },
      tx
    );

    return [interview, interviewCall];
  });

  res.status(200).json({ interview, call: interviewCall });
}

async function findInterviews(req: Request, res: Response, next: NextFunction) {
  const allowed = enforceRequest(req);
  if (!allowed) return next(forbidden());

  const { userId } = findInterviewsPayload.parse(req.params);
  const list = await interviews.findByUser(userId);
  res.status(200).json(list);
}

async function findInterviewById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { interviewId } = findInterviewByIdParams.parse(req.params);
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
  const { interviewId } = updateInterviewParams.parse(req.params);
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
