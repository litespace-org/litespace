import { logger, safe } from "@litespace/sol";
import { calls } from "@litespace/models";
import { isGhost, isTutor, isUser } from "@litespace/auth";
import { Wss } from "@litespace/types";
import { getGhostCall } from "@litespace/sol/ghost";
import { cache } from "@/lib/cache";
import { id, string } from "@/validation/utils";
import { WSSHandler } from "./base";

import zod from "zod";
import { isEmpty } from "lodash";

const peerPayload = zod.object({ callId: id, peerId: string });
const registerPeerPayload = zod.object({ peer: zod.string() });

const stdout = logger("wss");

export class PeerHandler extends WSSHandler {
  async peerOpened(data: unknown) {
    const error = await safe(async () => {
      const { callId, peerId } = peerPayload.parse(data);
      const user = this.user;

      const members = await calls.findCallMembers([callId]);
      if (isEmpty(members)) return;

      const memberIds = members.map((member) => member.userId);
      const isMember = isUser(user) && memberIds.includes(user.id);
      const allowed = isMember || isGhost(this.user);
      if (!allowed) return;

      this.socket.join(callId.toString());
      this.socket
        .to(callId.toString())
        .emit(Wss.ServerEvent.UserJoinedCall, { peerId });
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
        await cache.peer.setGhostPeerId(getGhostCall(user), peer);
      if (isTutor(user)) 
        await cache.peer.setUserPeerId(user.id, peer);

      // notify peers to refetch the peer id if needed
    });
    if (result instanceof Error) stdout.error(result.message);
  }
}
