import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { forbidden, notfound } from "@/lib/error";
import { isAdmin, isGhost, isUser } from "@litespace/auth";
import { canJoinSession } from "@/lib/session";
import { cache } from "@/lib/cache";
import { ISession } from "@litespace/types";
import zod from "zod";
import { sessionId } from "@/validation/utils";
import { interviews, lessons } from "@litespace/models";
import { asSessionId } from "@litespace/sol";

export const findSessionByIdParams = zod.object({ sessionId: sessionId });
export const findSessionMembersParams = zod.object({ sessionId: sessionId });

async function findSessionById(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isUser(user) || isGhost(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findSessionByIdParams.parse(req.params);
  const sessionType = sessionId.split(":")[0]; // lesson or interview

  const model = sessionType === "lesson" ? lessons : interviews;

  const [session, members] = await Promise.all([
    model.findBySessionId(asSessionId(sessionId)),
    model.findSessionMembers(sessionId),
  ]);
  if (!session) return next(notfound.session());

  const member =
    isUser(user) && members.map((member) => member.userId).includes(user.id);
  const eligible = member || isAdmin(req.user) || isGhost(user);
  if (!eligible) next(forbidden());

  res.status(200).json({ session, members });
}

async function findSessionMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findSessionMembersParams.parse(req.params);

  const canJoin = await canJoinSession({
    userId: user.id,
    sessionId,
  });

  const eligible = canJoin || isAdmin(user);
  if (!eligible) return next(forbidden());

  const members = await cache.session.getMembers(asSessionId(sessionId));
  const response: ISession.FindSessionMembersApiResponse = members;
  res.status(200).json(response);
}

export default {
  findSessionById: safeRequest(findSessionById),
  findSessionMembers: safeRequest(findSessionMembers),
};
