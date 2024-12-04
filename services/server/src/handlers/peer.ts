import { cache } from "@/lib/cache";
import { bad, forbidden } from "@/lib/error";
import { id, string } from "@/validation/utils";
import { isGhost, isStudent, isTutor } from "@litespace/auth";
import { IPeer } from "@litespace/types";
import { NextFunction, Request, Response } from "express";
import safeRequest from "express-async-handler";
import zod from "zod";

const registerPeerIdPayload = zod.object({
  peer: string,
  call: zod.optional(id),
});

const deletePeerIdQuery = zod.object({
  call: zod.optional(id),
});

const findPeerIdApiQuery = zod.union([
  zod.object({
    type: zod.literal(IPeer.PeerType.Tutor),
    tutor: id,
  }),
  zod.object({
    type: zod.literal(IPeer.PeerType.Ghost),
    call: id,
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

  const { peer, call }: IPeer.RegisterPeerIdApiPayload =
    registerPeerIdPayload.parse(req.body);
  if (ghost && !call) return next(bad());
  if (ghost && call) await cache.peer.setGhostPeerId(call, peer);
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

  const { call }: IPeer.DeletePeerIdApiQurey = deletePeerIdQuery.parse(
    req.query
  );
  if (ghost && !call) return next(bad());
  if (ghost && call) await cache.peer.removeGhostPeerId(call);
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
      : await cache.peer.getGhostPeerId(query.call);

  const response: IPeer.FindPeerIdApiResponse = { peer };
  res.status(200).json(response);
}

export default {
  registerPeerId: safeRequest(registerPeerId),
  deletePeerId: safeRequest(deletePeerId),
  findPeerId: safeRequest(findPeerId),
};
