import { isAdmin, isGhost, isStudent, isTutor } from "@litespace/auth";
import { dayjs, logger, safe } from "@litespace/sol";
import { Wss } from "@litespace/types";
import { WssHandler } from "@/wss/handlers/base";
import { interviews, lessons, rooms } from "@litespace/models";
import { background } from "@/workers";
import { PartentPortMessage, PartentPortMessageType } from "@/workers/messages";
import { asSessionRoomId, asChatRoomId } from "@/wss/utils";
import { cache } from "@/lib/cache";
import { getGhostSession } from "@litespace/sol/ghost";

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

      await this.joinRooms();
      if (isAdmin(this.user)) this.emitServerStats();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async disconnect() {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      await cache.onlineStatus.removeUser(user.id);
      this.announceStatus({ userId: user.id, online: false });

      await this.deregisterPeer();
      await this.removeUserFromSessions();
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  private async announceStatus({
    userId, 
    online,
  }: {
    userId: number, 
    online: boolean,
  }) {
    const userRooms = await rooms.findMemberFullRoomIds(userId);
    for (const room of userRooms) {
      this.broadcast(
        Wss.ServerEvent.UserStatusChanged,
        asChatRoomId(room),
        { online, userId, roomId: room },
      );
    }
  }

  private async emitServerStats() {
    background.on("message", (message: PartentPortMessage) => {
      if (message.type === PartentPortMessageType.Stats)
        return this.socket.emit(
          Wss.ServerEvent.ServerStats, 
          message.stats,
        );
    });
  }

  // TODO: put some more thought on this function implementaion details
  private async joinRooms() {
    const error = await safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;

      const { list } = await rooms.findMemberRooms({ userId: user.id });

      this.socket.join(list.map((roomId) => asChatRoomId(roomId)));
      // private channel
      this.socket.join(user.id.toString());

      if (isStudent(this.user)) this.socket.join(Wss.Room.TutorsCache);
      if (isAdmin(this.user)) this.socket.join(Wss.Room.ServerStats);

      // TODO: get user sessions from cache
      const lessonsSessions = (await lessons.find({
        users: [user.id],
        full: true,
        after: dayjs.utc().startOf("day").toISOString(),
        before: dayjs.utc().add(1, "day").toISOString(),
      })).list.map(lesson => lesson.sessionId);

      const interviewsSessions = (await interviews.find({
        users: [user.id],
      })).list.map(interview => interview.ids.session);

      this.socket.join([...lessonsSessions, ...interviewsSessions].map(
        (session) => asSessionRoomId(session))
      );
    });

    if (error instanceof Error) stdout.error(error.message);
  }

  /**
   * Remove ghost and tutor peer id from the cache.
   *
   * @note should be called when the socket disconnects from the server.
   */
  private async deregisterPeer() {
    // todo: notify peers that the current user got disconnected
    const user = this.user;
    const display = isGhost(user) ? user : user.email;
    stdout.info(`Deregister peer for: ${display}`);

    if (isGhost(user))
      return await cache.peer.removeGhostPeerId(getGhostSession(user));
    if (isTutor(user)) await cache.peer.removeUserPeerId(user.id);
  }

  private async removeUserFromSessions() {
    const user = this.user;
    if (isGhost(user)) return;

    const sessionId = await cache.session.removeMemberByUserId(user.id);
    if (!sessionId) return;

    // notify members that a member has left the session
    this.socket.broadcast
      .to(asSessionRoomId(sessionId))
      .emit(Wss.ServerEvent.MemberLeftSession, {
        userId: user.id,
      });
  }
}
