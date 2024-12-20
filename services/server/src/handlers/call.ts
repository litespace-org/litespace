import { calls } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { id, withNamedId } from "@/validation/utils";
import { forbidden, notfound } from "@/lib/error";
import { isAdmin, isGhost, isUser } from "@litespace/auth";
import { canJoinCall } from "@/lib/call";
import { cache } from "@/lib/cache";
import { ICall } from "@litespace/types";
import zod from "zod";

const types = ["lesson", "interview"] as const satisfies ICall.Type[];

export const findCallMembersParams = zod.object({
  callId: id,
  callType: zod.enum(types),
});

async function findCallById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user) || isGhost(user);
  if (!allowed) return next(forbidden());

  const { callId } = withNamedId("callId").parse(req.params);
  const [call, members] = await Promise.all([
    calls.findById(callId),
    calls.findCallMembers([callId]),
  ]);
  if (!call) return next(notfound.call());

  const member =
    isUser(user) && members.map((member) => member.userId).includes(user.id);
  const eligible = member || isAdmin(req.user) || isGhost(user);
  if (!eligible) next(forbidden());

  res.status(200).json({ call, members });
}

async function findCallMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { callId, callType } = findCallMembersParams.parse(req.params);

  const canJoin = await canJoinCall({
    userId: user.id,
    callType,
    callId,
  });

  const eligible = canJoin || isAdmin(user);
  if (!eligible) return next(forbidden());

  const members = await cache.call.getMembers(callId);
  const response: ICall.FindCallMembersApiResponse = members;
  res.status(200).json(response);
}

export default {
  findCallById: safeRequest(findCallById),
  findCallMembers: safeRequest(findCallMembers),
};
