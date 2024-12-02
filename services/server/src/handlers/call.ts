import { calls } from "@litespace/models";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { withNamedId } from "@/validation/utils";
import { groupBy } from "lodash";
import { forbidden, notfound } from "@/lib/error";
import { isAdmin, isGhost, isUser } from "@litespace/auth";

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

export default {
  findCallById: asyncHandler(findCallById),
};
