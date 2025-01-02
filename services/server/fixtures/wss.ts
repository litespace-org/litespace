import { io, Socket } from "socket.io-client";
import { sockets } from "@litespace/atlas";
import { Backend, ISession, Wss } from "@litespace/types";

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

  joinSession(sessionId: ISession.Id) {
    this.client.emit(Wss.ClientEvent.JoinSession, { sessionId });
  }

  leaveSession(sessionId: ISession.Id) {
    this.client.emit(Wss.ClientEvent.LeaveSession, { sessionId });
  }

  sendMessage(roomId: number, text: string) {
    return this.emit(Wss.ClientEvent.SendMessage, { roomId, text });
  }

  deleteMessage(msgId: number) {
    return this.emit(Wss.ClientEvent.DeleteMessage, { id: msgId });
  }

  markMessageAsRead(msgId: number) {
    return this.emit(Wss.ClientEvent.MarkMessageAsRead, { id: msgId });
  }

  async emit<T extends keyof Wss.ClientEventsMap>(
    event: keyof Wss.ClientEventsMap,
    data: Parameters<Wss.ClientEventsMap[T]>[0]
  ): Promise<Wss.AcknowledgePayload> {
    return new Promise((resolve, _) => {
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
  ): Promise<Parameters<Wss.ServerEventsMap[T]>[0]> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      this.client.on(event, resolve);
      setTimeout(() => reject(new Error("TIMEOUT")), 2_000);
    });
  }
}
