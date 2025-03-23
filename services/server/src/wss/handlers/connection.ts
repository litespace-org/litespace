import { isGhost, isStudent } from "@litespace/utils/user";
import { logger, safe } from "@litespace/utils";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { rooms } from "@litespace/models";
import { asSessionRoomId, asChatRoomId } from "@/wss/utils";
import { cache } from "@/lib/cache";

const stdout = logger("wss");

export class Connection extends WssHandler {
  public init(): Connection {
    this.connect();
    this.socket.on(Wss.ClientEvent.Disconnect, this.disconnect.bind(this));
    return this;
  }

  async connect() {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      await cache.onlineStatus.addUser(user.id);
      this.announceStatus({ userId: user.id, online: true });
      this.joinChatRooms();

      if (isStudent(this.user)) this.socket.join(Wss.Room.TutorsCache);
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async disconnect() {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      await cache.onlineStatus.removeUser(user.id);
      this.announceStatus({ userId: user.id, online: false });

      await this.removeUserFromSessions();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  private async announceStatus({
    userId,
    online,
  }: {
    userId: number;
    online: boolean;
  }) {
    const userRooms = await rooms.findMemberFullRoomIds(userId);
    for (const room of userRooms) {
      this.broadcast(Wss.ServerEvent.UserStatusChanged, asChatRoomId(room), {
        online,
        userId,
        roomId: room,
      });
    }
  }

  /**
   * This function is invoked on each user connection, it lets the user
   * listen to events appertain to chat messages.
   */
  private async joinChatRooms() {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { list } = await rooms.findMemberRooms({ userId: user.id });
      this.socket.join(list.map((roomId) => asChatRoomId(roomId)));
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  private async removeUserFromSessions() {
    const user = this.user;
    if (isGhost(user)) return;

    const sessionId = await cache.session.removeMemberByUserId(user.id);
    if (!sessionId) return;

    // notify other members that a member has left the session.
    this.socket.broadcast
      .to(asSessionRoomId(sessionId))
      .emit(Wss.ServerEvent.MemberLeftSession, {
        userId: user.id,
      });
  }
}
