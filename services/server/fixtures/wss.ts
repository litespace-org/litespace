import { io, Socket } from "socket.io-client";
import { sockets } from "@litespace/atlas";
import { Backend, ISession, Wss } from "@litespace/types";
import { uniqueId } from "lodash";

export class ClientSocket {
  public readonly client: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap>;

  constructor(token: string) {
    const options = {
      extraHeaders: { Authorization: `Bearer ${token}` },
    } as const;
    this.client = io(sockets.main[Backend.Local], options);
  }

  userTyping(roomId: number) {
    return this.emit(Wss.ClientEvent.UserTyping, { roomId });
  }

  preJoinSession(sessionId: ISession.Id) {
    return this.emit(Wss.ClientEvent.PreJoinSession, { sessionId });
  }

  joinSession(sessionId: ISession.Id) {
    return this.emit(Wss.ClientEvent.JoinSession, { sessionId });
  }

  leaveSession(sessionId: ISession.Id) {
    return this.emit(Wss.ClientEvent.LeaveSession, { sessionId });
  }

  sendMessage(roomId: number, text: string) {
    const refId = uniqueId();
    return this.emit(Wss.ClientEvent.SendMessage, { roomId, text, refId });
  }

  deleteMessage(msgId: number) {
    return this.emit(Wss.ClientEvent.DeleteMessage, { id: msgId });
  }

  markMessageAsRead(msgId: number) {
    return this.emit(Wss.ClientEvent.MarkMessageAsRead, { id: msgId });
  }

  async emit<T extends keyof Wss.ClientEventsMap>(
    event: keyof Wss.ClientEventsMap,
    data: Wss.EventPayload<T>
  ): Promise<Wss.AcknowledgePayload> {
    return new Promise((resolve, _) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client.emit(event, data as any, (ack) => ack && resolve(ack));
      setTimeout(() => resolve({ code: Wss.AcknowledgeCode.Ok }), 2_000);
    });
  }

  /**
   * Wait for event.
   *
   * Wrapp event callback with promise.
   */
  async wait<T extends keyof Wss.ServerEventsMap>(
    event: T
  ): Promise<Wss.EventPayload<T>> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error it hard to get the `event` type to match what socket.io expects
      this.client.on(event, resolve);
      setTimeout(() => reject(new Error("TIMEOUT")), 2_000);
    });
  }
}
