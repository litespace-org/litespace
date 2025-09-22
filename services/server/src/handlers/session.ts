import { cache } from "@/lib/cache";
import { bad, forbidden } from "@/lib/error";
import { canAccessSession } from "@/lib/session";
import { isUser } from "@litespace/utils/user";
import { isSessionId, optional } from "@litespace/utils";
import { ISession } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import { AccessToken } from "livekit-server-sdk";
import { livekitConfig } from "@/constants";
import { sessionId } from "@/validation/utils";
import zod, { ZodSchema } from "zod";
import { users } from "@litespace/models";

const findSessionMembersParams: ZodSchema<ISession.FindSessionMembersApiParams> =
  zod.object({ sessionId });

const getSessionTokenQuery: ZodSchema<ISession.GetSessionTokenApiQuery> =
  zod.object({ sessionId });

async function findSessionMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId } = findSessionMembersParams.parse(req.params);
  if (!isSessionId(sessionId)) return next(bad());

  const ok = await canAccessSession({ sessionId, userId: user.id });
  if (!ok) return next(forbidden());

  const memberIds = await cache.session.getMembers(sessionId);
  const { list: members } = memberIds.length
    ? await users.find({ ids: memberIds, full: true })
    : { list: [] };
  const response: ISession.FindSessionMembersApiResponse = members.map(
    (member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      gender: member.gender,
    })
  );

  res.status(200).json(response);
}

async function getSessionToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const allowed = isUser(user);
  if (!allowed) return next(forbidden());

  const { sessionId }: ISession.GetSessionTokenApiQuery =
    getSessionTokenQuery.parse(req.query);
  if (!isSessionId(sessionId)) return next(bad());

  const ok = await canAccessSession({ sessionId, userId: user.id });
  if (!ok) return next(forbidden());

  // ref: https://docs.livekit.io/home/get-started/authentication/
  const at = new AccessToken(livekitConfig.apiKey, livekitConfig.apiSecret, {
    identity: user.id.toString(),
    name: optional(user.name),
    ttl: "10m",
  });

  at.addGrant({
    room: sessionId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await at.toJwt();

  const response: ISession.GetSessionTokenApiResponse = { token: jwt };
  res.status(200).json(response);
}

export default {
  findSessionMembers: safeRequest(findSessionMembers),
  getSessionToken: safeRequest(getSessionToken),
};
