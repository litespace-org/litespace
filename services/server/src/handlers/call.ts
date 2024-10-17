import { calls } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { withNamedId } from "@/validation/utils";
import { groupBy, map } from "lodash";
import { forbidden, notfound } from "@/lib/error";
import { isAdmin, isUser } from "@litespace/auth";

async function findCallById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { callId } = withNamedId("callId").parse(req.params);
  const [call, members] = await Promise.all([
    calls.findById(callId),
    calls.findCallMembers([callId]),
  ]);
  if (!call) return next(notfound.call());

  const eligible =
    members.map((member) => member.userId).includes(user.id) ||
    isAdmin(req.user);
  if (!eligible) next(forbidden());
  res.status(200).json({ call, members });
}

async function findCallsByUserId(req: Request, res: Response) {
  const { userId } = withNamedId("userId").parse(req.params);
  const userCalls = await calls.findMemberCalls({ userIds: [userId] });
  const members = await calls.findCallMembers(map(userCalls, "id"));
  const callMembersMap = groupBy(members, "callId");
  res.status(200).json({ calls: userCalls, members: callMembersMap });
}

export default {
  findCallById: asyncHandler(findCallById),
  findCallsByUserId: asyncHandler(findCallsByUserId),
};
