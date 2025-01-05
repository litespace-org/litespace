import { cache } from "@/lib/cache";
import { canJoinSessionAck } from "@/lib/session";
import { isGhost, isUser } from "@litespace/auth";
import { asSessionId, logger, safe } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { asSessionRoomId } from "@/wss/utils";

import zod from "zod";
import { sessionId } from "@/validation/utils";

const stdout = logger("wss");

const generalSessionPayload = zod.object({ sessionId: sessionId });

export class Session extends WssHandler {
  public init(): Session {
    this.socket.on(
      Wss.ClientEvent.PreJoinSession,
      this.onPreJoinSession.bind(this)
    );
    this.socket.on(Wss.ClientEvent.JoinSession, this.onJoinSession.bind(this));
    this.socket.on(
      Wss.ClientEvent.LeaveSession,
      this.onLeaveSession.bind(this)
    );
    return this;
  }

  /*
   *  This event listener shall be called whenever a user
   *  wants to get updates about the current session (e.g., current members)
   *  but without joining the session. It adds the user socket to the session socket room.
   */
  async onPreJoinSession(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const result = await safe(async () => {
      const { sessionId } = generalSessionPayload.parse(data);

      const ack = await this.canJoinSession(sessionId);
      this.call(callback, ack);
      if (ack.code !== Wss.AcknowledgeCode.Ok) return;

      // join the user socket to the corresponding session socket.io room
      this.socket.join(asSessionRoomId(sessionId));
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  /*
   *  This event listener will be called whenever a user
   *  joins a session. For instance, when
   *  users are joining a lesson, or a tutor is joining an
   *  interview.
   */
  async onJoinSession(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const result = await safe(async () => {
      const { sessionId } = generalSessionPayload.parse(data);

      const ack = await this.canJoinSession(sessionId);
      this.call(callback, ack);
      if (ack.code !== Wss.AcknowledgeCode.Ok) return;

      const user = this.user;
      if (!isUser(user)) return;

      // add user to the session by adding its id in the cache
      await cache.session.addMember({
        userId: user.id,
        sessionId: asSessionId(sessionId),
      });

      // notify members that a new member has joined the session
      // NOTE: the user notifies himself as well that he successfully joined the session.
      this.broadcast(
        Wss.ServerEvent.MemberJoinedSession,
        asSessionRoomId(sessionId),
        { userId: user.id }
      );
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  /**
   *  Just an ancillary function for onPreJoinSession and
   *  onJoinSession to clean (DRY) the code a little.
   *  @returns null if the user can join the session,
   *  otherwise returns Wss.AcknowledgePayload
   */
  private async canJoinSession(
    sessionId: string
  ): Promise<Wss.AcknowledgePayload> {
    const user = this.user;
    // todo: add ghost as a member of the session
    if (!user)
      return {
        code: Wss.AcknowledgeCode.Unreachable,
        message:
          "something went wrong! user is undefined; check the authentication middleware.",
      };

    if (isGhost(user))
      return {
        code: Wss.AcknowledgeCode.Unallowed,
        message: "ghost is not supported yet.",
      };

    return await canJoinSessionAck({
      userId: user.id,
      sessionId,
    });
  }

  /*
   *  This event listener will be called whenever a user
   *  leaves a session. For instance, when users are leaving
   *  a lesson, or a tutor is leaving an interview.
   */
  async onLeaveSession(data: unknown) {
    const result = await safe(async () => {
      const { sessionId } = generalSessionPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      // remove user from the session by removing its id from the cache
      await cache.session.removeMember({
        userId: user.id,
        sessionId: asSessionId(sessionId),
      });

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
