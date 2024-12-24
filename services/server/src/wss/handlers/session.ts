import { cache } from "@/lib/cache";
import { canJoinSession } from "@/lib/session";
import { isGhost } from "@litespace/auth";
import { asSessionId, logger, safe } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { asSessionRoomId } from "@/wss/utils";

import zod from "zod";
import { sessionId } from "@/validation/utils";

const stdout = logger("wss");

const onJoinSessionPayload = zod.object({ sessionId: sessionId });
const onLeaveSessionPayload = zod.object({ sessionId: sessionId });

export class Session extends WssHandler {
  public init(): Session {
    this.socket.on(Wss.ClientEvent.JoinSession, this.onJoinSession.bind(this));
    this.socket.on(Wss.ClientEvent.LeaveSession, this.onLeaveSession.bind(this));
    return this;
  }

  /*
   *  This event listener will be called whenever a user
   *  joins a session. For instance, when
   *  users are joining a lesson, or a tutor is joining an
   *  interview.
   */
  async onJoinSession(data: unknown) {
    const result = await safe(async () => {
      const { sessionId } = onJoinSessionPayload.parse(data);

      const user = this.user;
      // todo: add ghost as a member of the session
      if (!user) return stdout.error("user undefined!");
      if (isGhost(user)) return stdout.warning("Unsupported");

      stdout.info(`User ${user.id} is joining session ${sessionId}.`);

      const canJoin = await canJoinSession({
        userId: user.id,
        sessionId,
      });

      if (!canJoin) throw Error("Forbidden");

      // add user to the session by adding its id in the cache
      await cache.session.addMember({ userId: user.id, sessionId: asSessionId(sessionId) });
      this.socket.join(asSessionRoomId(sessionId));

      stdout.info(`User ${user.id} has joined session ${sessionId}.`);

      // TODO: retrieve user data (ISession.PopulatedMember) from the database
      // discuss with the team if shall we retrieve it from postgres,
      // or store it in redis in the first place.

      // notify members that a new member has joined the session
      // NOTE: the user notifies himself as well that he successfully joined the session.
      this.broadcast(
        Wss.ServerEvent.MemberJoinedSession,
        asSessionRoomId(sessionId),
        { userId: user.id } // TODO: define the payload struct type in the types package
      );
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  /*
   *  This event listener will be called whenever a user
   *  leaves a session. For instance, when users are leaving
   *  a lesson, or a tutor is leaving an interview.
   */
  async onLeaveSession(data: unknown) {
    const result = await safe(async () => {
      const { sessionId } = onLeaveSessionPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      stdout.info(`User ${user.id} is leaving session ${sessionId}.`);

      // remove user from the session by removing its id from the cache
      await cache.session.removeMember({
        userId: user.id,
        sessionId: asSessionId(sessionId),
      });

      stdout.info(`User ${user.id} has left session ${sessionId}.`);

      // notify members that a member has left the session
      this.socket.broadcast
        .to(asSessionRoomId(sessionId))
        .emit(Wss.ServerEvent.MemberLeftSession, {
          userId: user.id,
        });
    });
    if (result instanceof Error) stdout.error(result.message);
  }
}
