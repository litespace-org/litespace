import { cache } from "@/lib/cache";
import { canJoinCall } from "@/lib/call";
import { isGhost } from "@litespace/auth";
import { logger, safe } from "@litespace/sol";
import { ICall, Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { asCallRoomId } from "@/wss/utils";

import zod from "zod";

const callTypes = ["lesson", "interview"] as const satisfies ICall.Type[];
const stdout = logger("wss");

const onJoinCallPayload = zod.object({
  callId: zod.number(),
  type: zod.enum(callTypes),
});
const onLeaveCallPayload = zod.object({ callId: zod.number() });

export class Call extends WssHandler {
  public init(): Call {
    this.socket.on(Wss.ClientEvent.JoinCall, this.onJoinCall.bind(this));
    this.socket.on(Wss.ClientEvent.LeaveCall, this.onLeaveCall.bind(this));
    return this;
  }

  /*
   *  This event listener will be called whenever a user
   *  joins a call. For instance, when
   *  users are joining a lesson, or a tutor is joining an
   *  interview.
   */
  async onJoinCall(data: unknown) {
    const result = await safe(async () => {
      const { callId, type } = onJoinCallPayload.parse(data);

      const user = this.user;
      // todo: add ghost as a member of the call
      if (!user) return stdout.error("user undefined!");
      if (isGhost(user)) return stdout.warning("Unsupported");

      stdout.info(`User ${user.id} is joining call ${callId}.`);

      const canJoin = await canJoinCall({
        userId: user.id,
        callType: type,
        callId,
      });

      if (!canJoin) throw Error("Forbidden");

      // add user to the call by inserting row to call_members relation
      await cache.call.addMember({ userId: user.id, callId: callId });
      this.socket.join(asCallRoomId(callId));

      stdout.info(`User ${user.id} has joined call ${callId}.`);

      // TODO: retrieve user data (ICall.PopulatedMember) from the database
      // discuss with the team if shall we retrieve it from postgres,
      // or store it in redis in the first place.

      // notify members that a new member has joined the call
      // NOTE: the user notifies himself as well that he successfully joined the call.
      this.broadcast(
        Wss.ServerEvent.MemberJoinedCall,
        asCallRoomId(callId),
        { userId: user.id }, // TODO: define the payload struct type in the types package
        () => {}
      );
    });
    if (result instanceof Error) stdout.error(result.message);
  }

  /*
   *  This event listener will be called whenever a user
   *  leaves a call. For instance, when users are leaving
   *  a lesson, or a tutor is leaving an interview.
   */
  async onLeaveCall(data: unknown) {
    const result = await safe(async () => {
      const { callId } = onLeaveCallPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      stdout.info(`User ${user.id} is leaving call ${callId}.`);

      // remove user from the call by deleting the corresponding row from call_members relation
      await cache.call.removeMember({
        userId: user.id,
        callId: callId,
      });

      stdout.info(`User ${user.id} has left call ${callId}.`);

      // notify members that a member has left the call
      this.socket.broadcast
        .to(asCallRoomId(callId))
        .emit(Wss.ServerEvent.MemberLeftCall, {
          userId: user.id,
        }, () => {});
    });
    if (result instanceof Error) stdout.error(result.message);
  }
}
