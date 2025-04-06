import { cache } from "@/lib/cache";
import { canAccessSession } from "@/lib/session";
import { isGhost, isUser } from "@litespace/utils/user";
import { isSessionId, logger, safe } from "@litespace/utils";
import { ISessionEvent, Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { asSessionRoomId } from "@/wss/utils";

import zod from "zod";
import { sessionId } from "@/validation/utils";
import { sendBackgroundMessage } from "@/workers";

const stdout = logger("wss");

const generalSessionPayload = zod.object({ sessionId: sessionId });

const sdpType = zod.union([
  zod.literal("answer"),
  zod.literal("offer"),
  zod.literal("pranswer"),
  zod.literal("rollback"),
]);

const iceCandidate = zod.object({
  candidate: zod.string().optional(),
  sdpMLineIndex: zod.number().optional().or(zod.null()),
  sdpMid: zod.string().optional().or(zod.null()),
  usernameFragment: zod.string().optional().or(zod.null()),
});

const sessionOfferPayload = zod.object({
  sessionId,
  offer: zod.object({
    type: sdpType,
    sdp: zod.string(),
  }),
});

const sessionAnswerPayload = zod.object({
  sessionId,
  answer: zod.object({
    type: sdpType,
    sdp: zod.string().optional(),
  }),
});

const iceCandidatePayload = zod.object({
  sessionId,
  candidate: iceCandidate,
});

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
    this.socket.on(
      Wss.ClientEvent.SessionOffer,
      this.onSessionOffer.bind(this)
    );
    this.socket.on(
      Wss.ClientEvent.SessionAnswer,
      this.onSessionAnswer.bind(this)
    );
    this.socket.on(
      Wss.ClientEvent.IceCandidate,
      this.onIceCandidate.bind(this)
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

      const user = this.user;
      if (!isUser(user)) return;

      if (!isSessionId(sessionId))
        return this.call(callback, {
          code: Wss.AcknowledgeCode.InvalidSessionId,
          message: `${sessionId} is not a valid session id`,
        });

      const ok = await canAccessSession({
        sessionId,
        userId: user.id,
      });

      if (!ok)
        return this.call(callback, { code: Wss.AcknowledgeCode.Unallowed });
      else this.call(callback, { code: Wss.AcknowledgeCode.Ok });

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

      const user = this.user;
      if (!isUser(user)) return;

      const ok = await canAccessSession({
        sessionId,
        userId: user.id,
      });

      if (!ok)
        return this.call(callback, { code: Wss.AcknowledgeCode.Unallowed });
      else this.call(callback, { code: Wss.AcknowledgeCode.Ok });

      sendBackgroundMessage({
        type: "create-session-event",
        payload: {
          type: ISessionEvent.EventType.UserJoined,
          userId: user.id,
          sessionId,
        },
      });

      // add user to the session by adding its id in the cache
      await cache.session.addMember({
        userId: user.id,
        sessionId,
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

      sendBackgroundMessage({
        type: "create-session-event",
        payload: {
          type: ISessionEvent.EventType.UserLeft,
          userId: user.id,
          sessionId,
        },
      });

      // Remove user from the session by removing its id from the cache
      await cache.session.removeMember({
        userId: user.id,
        sessionId,
      });

      // notify members that a member has left the session
      this.broadcast(
        Wss.ServerEvent.MemberLeftSession,
        asSessionRoomId(sessionId),
        {
          userId: user.id,
        }
      );
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async onSessionOffer(data: unknown) {
    const result = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { sessionId, offer } = sessionOfferPayload.parse(data);
      const ok = await canAccessSession({
        sessionId,
        userId: user.id,
      });
      if (!ok) return;

      this.socket.broadcast
        .to(asSessionRoomId(sessionId))
        .emit(Wss.ServerEvent.SessionOffer, { offer });
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async onSessionAnswer(data: unknown) {
    const result = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { sessionId, answer } = sessionAnswerPayload.parse(data);
      const ok = await canAccessSession({
        sessionId,
        userId: user.id,
      });
      if (!ok) return;

      this.socket.broadcast
        .to(asSessionRoomId(sessionId))
        .emit(Wss.ServerEvent.SessionAnswer, { answer });
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  async onIceCandidate(data: unknown) {
    const result = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { sessionId, candidate } = iceCandidatePayload.parse(data);
      const ok = await canAccessSession({
        sessionId,
        userId: user.id,
      });
      if (!ok) return;

      this.socket.broadcast
        .to(asSessionRoomId(sessionId))
        .emit(Wss.ServerEvent.IceCandidate, { candidate });
    });
    if (result instanceof Error) stdout.error(result.message);
  }
}
