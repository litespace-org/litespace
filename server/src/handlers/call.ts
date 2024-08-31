import { calls } from "@/models";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { withNamedId } from "@/validation/utils";
import { groupBy, map } from "lodash";
import { notfound } from "@/lib/error";

// async function createCall(req: Request, res: Response, next: NextFunction) {
//   const allowed = enforceRequest(req);
//   if (!allowed) return next(forbidden());

//   const payload = createCallPayload.parse(req.body);
//   if (!durations.includes(payload.duration)) return next(badRequest());

//   const rule = await rules.findById(payload.ruleId);
//   if (!rule) return next(notfound.base());

//   const host = await users.findById(rule.userId);
//   if (!host) return next(notfound.user());

//   const student = req.user.role === IUser.Role.Student;
//   const tutor = req.user.role === IUser.Role.Tutor;
//   // Only "students" can create "lessons" with "tutors"
//   const lesson =
//     student &&
//     host.role === IUser.Role.Tutor &&
//     payload.type === ICall.Type.Lesson;
//   // Only "tutors" can create "interviews" with "interviewers"
//   const interview =
//     tutor &&
//     host.role === IUser.Role.Interviewer &&
//     payload.type === ICall.Type.Interview;
//   const eligible = lesson || interview;
//   if (!eligible) return next(forbidden());

//   if (interview) {
//     const interviews = await calls.findTutorInterviews(req.user.id);
//     if (!canBeInterviewed(interviews)) return next(badRequest());
//   }

// const bookedCalls = await calls.findBySlotId(payload.ruleId);
// const enough = hasEnoughTime({
//   call: { start: payload.start, duration: payload.duration },
//   calls: bookedCalls,
//   slot,
// });
// if (!enough) return next(badRequest());

//   const call = await calls.create({
//     hostId: host.id,
//     type: payload.type,
//     start: payload.start,
//     ruleId: payload.ruleId,
//     attendeeId: req.user.id,
//     duration: payload.duration,
//   });

//   res.status(200).json(call);
// }

// async function deleteCall(req: Request, res: Response, next: NextFunction) {
//   const { id } = schema.http.call.delete.params.parse(req.params);
//   const call = await calls.findById(id);
//   if (!call) return next(notfound.call());

//   const userId = req.user.id;
//   const owner = userId === call.hostId || userId === call.attendeeId;
//   const eligible = owner || isAdmin(req.user.role);
//   if (!eligible) return next(forbidden());

//   await calls.delete(id);
//   res.status(200).send();
// }

// async function getCalls(user: IUser.Self): Promise<ICall.Self[]> {
//   const id = user.id;
//   const role = user.role;
//   const studnet = role === IUser.Role.Student;
//   const tutor = role === IUser.Role.Tutor;
//   const interviewer = role === IUser.Role.Interviewer;
//   if (studnet) return await calls.findByAttendeeId(id);
//   if (tutor || interviewer) return await calls.findByHostId(id);
//   return await calls.findAll(); // admin
// }

// async function getMany(req: Request, res: Response, next: NextFunction) {
//   const allowed = enforceRequest(req);
//   if (!allowed) return next(forbidden());
//   const calls = await getCalls(req.user);
//   res.status(200).json(calls);
// }

async function findCallById(req: Request, res: Response, next: NextFunction) {
  const { callId } = withNamedId("callId").parse(req.params);
  const [call, members] = await Promise.all([
    calls.findById(callId),
    calls.findCallMembers([callId]),
  ]);
  if (!call) return next(notfound.call());
  res.status(200).json({ call, members });
}

async function findCallsByUserId(req: Request, res: Response) {
  const { userId } = withNamedId("userId").parse(req.params);
  const userCalls = await calls.findMemberCalls({ userIds: [userId] });
  const members = await calls.findCallMembers(map(userCalls, "id"));
  const callMembersMap = groupBy(members, "callId");
  res.status(200).json({ calls: userCalls, members: callMembersMap });
}

// should be moved to the `/interview` route and then removed.
// async function findTutorInterviews(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const { id } = identityObject.parse(req.params);
//   const tutor = await users.findById(id);
//   if (!tutor) return next(notfound.tutor());

//   const allowed = enforceRequest(req, id === tutor.id);
//   if (!allowed) return next(forbidden());

//   // const list = await calls.findTutorInterviews(id);
//   res.status(200).json([]);
// }

export default {
  // create: asyncHandler(createCall),
  // delete: asyncHandler(deleteCall),
  // get: asyncHandler(getOne),
  // list: asyncHandler(getMany),
  // findCall: asyncHandler(findCall),
  // findHostCalls: asyncHandler(findHostCalls),
  // findHostCallById: asyncHandler(findHostCallById),
  // findTutorInterviews: asyncHandler(findTutorInterviews),
  findCallById: asyncHandler(findCallById),
  findCallsByUserId: asyncHandler(findCallsByUserId),
};
