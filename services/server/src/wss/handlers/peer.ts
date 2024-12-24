import { asSessionId, logger, safe } from "@litespace/sol";
import { isGhost, isTutor, isUser } from "@litespace/auth";
import { Wss } from "@litespace/types";
import { getGhostSession } from "@litespace/sol/ghost";
import { cache } from "@/lib/cache";
import { sessionId, string } from "@/validation/utils";
import { WssHandler } from "@/wss/handlers/base";
import zod from "zod";
import { isEmpty } from "lodash";

const peerPayload = zod.object({ sessionId: sessionId, peerId: string });
const registerPeerPayload = zod.object({ peer: zod.string() });

const stdout = logger("wss");

/**
 * @deprecated should be removed in favor of the new call-cache-based design.
 */
export class Peer extends WssHandler {
  async peerOpened(data: unknown) {
    const error = await safe(async () => {
      const { sessionId, peerId } = peerPayload.parse(data);
      const user = this.user;

      const memberIds = await cache.session.getMembers(asSessionId(sessionId));
      if (isEmpty(memberIds)) return;

      const isMember = isUser(user) && memberIds.includes(user.id);
      const allowed = isMember || isGhost(this.user);
      if (!allowed) return;

      this.socket.join(sessionId);
      this.socket
        .to(sessionId)
        .emit(Wss.ServerEvent.UserJoinedSession, { peerId });
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async registerPeer(data: unknown) {
    const result = await safe(async () => {
      const { peer } = registerPeerPayload.parse(data);
      const user = this.user;
      const id = isGhost(user) ? user : user.email;
      stdout.info(`Register peer: ${peer} for ${id}`);

      if (isGhost(user))
        await cache.peer.setGhostPeerId(getGhostSession(user), peer);
      if (isTutor(user)) await cache.peer.setUserPeerId(user.id, peer);

      // notify peers to refetch the peer id if needed
    });
    if (result instanceof Error) stdout.error(result.message);
  }
}
