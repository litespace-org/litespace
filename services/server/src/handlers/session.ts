import { cache } from "@/lib/cache";
import { bad, forbidden } from "@/lib/error";
import { canAccessSession } from "@/lib/session";
import { isUser } from "@litespace/auth";
import { isSessionId } from "@litespace/sol";
import { ISession } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

const getSessionMembersParams = zod.object({ sessionId: zod.string() });

export async function findSessionMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = getSessionMembersParams.parse(req.params);
  if (!isSessionId(sessionId)) return next(bad());

  const ok = await canAccessSession({ sessionId, userId: user.id });
  if (!ok) return next(forbidden());

  const members = await cache.session.getMembers(sessionId);
  const response: ISession.FindSessionMembersApiResponse = members;
  res.status(200).json(response);
}

export default {
  findSessionMembers: safeRequest(findSessionMembers),
};
