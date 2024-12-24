import { cache } from "@/lib/cache";
import { bad, forbidden } from "@/lib/error";
import { id, sessionId, string } from "@/validation/utils";
import { isGhost, isStudent, isTutor } from "@litespace/auth";
import { IPeer } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

const registerPeerIdPayload = zod.object({
  peer: string,
  session: zod.optional(sessionId),
});

const deletePeerIdQuery = zod.object({
  session: zod.optional(sessionId),
});

const findPeerIdApiQuery = zod.union([
  zod.object({
    type: zod.literal(IPeer.PeerType.Tutor),
    tutor: id,
  }),
  zod.object({
    type: zod.literal(IPeer.PeerType.Ghost),
    session: sessionId,
  }),
]);

/**
 * @deprecated should be removed in favor of registering the peer id using web sockets.
 */
async function registerPeerId(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const ghost = isGhost(user);
  const tutor = isTutor(user);
  const allowed = ghost || tutor;
  if (!allowed) return next(forbidden());

  const { peer, session }: IPeer.RegisterPeerIdApiPayload =
    registerPeerIdPayload.parse(req.body);
  if (ghost && !session) return next(bad());
  if (ghost && session) await cache.peer.setGhostPeerId(session, peer);
  if (tutor) await cache.peer.setUserPeerId(user.id, peer);
  res.status(200).send();
}

/**
 * @deprecated should be removed in favor of de-registering the peer id using web sockets.
 */
async function deletePeerId(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const ghost = isGhost(user);
  const tutor = isTutor(user);
  const allowed = ghost || tutor;
  if (!allowed) return next(forbidden());

  const { session }: IPeer.DeletePeerIdApiQurey = deletePeerIdQuery.parse(
    req.query
  );
  if (ghost && !session) return next(bad());
  if (ghost && session) await cache.peer.removeGhostPeerId(session);
  if (tutor) await cache.peer.removeUserPeerId(user.id);

  res.status(200).send();
}

async function findPeerId(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const allowed = isStudent(user) || isTutor(user);
  if (!allowed) return next(forbidden());

  const query: IPeer.FindPeerIdApiQuery = findPeerIdApiQuery.parse(req.query);
  const peer =
    query.type === IPeer.PeerType.Tutor
      ? await cache.peer.getUserPeerId(query.tutor)
      : await cache.peer.getGhostPeerId(query.session);

  const response: IPeer.FindPeerIdApiResponse = { peer };
  res.status(200).json(response);
}

export default {
  registerPeerId: safeRequest(registerPeerId),
  deletePeerId: safeRequest(deletePeerId),
  findPeerId: safeRequest(findPeerId),
};
