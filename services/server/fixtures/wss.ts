import { io, Socket } from "socket.io-client";
import { sockets } from "@litespace/atlas";
import { Backend, ICall, Wss } from "@litespace/types";

export class ClientSocket {
  public readonly client: Socket<Wss.ServerEventsMap, Wss.ClientEventsMap>;

  constructor(token: string) {
    const options = {
      extraHeaders: { Authorization: `Bearer ${token}` },
    } as const;
    this.client = io(sockets.main[Backend.Local], options);
  }

  userTyping(roomId: number) {
    this.client.emit(Wss.ClientEvent.UserTyping, { roomId });
  }

  joinCall(callId: number, type: ICall.Type) {
    this.client.emit(Wss.ClientEvent.JoinCall, { callId, type });
  }

  leaveCall(callId: number) {
    this.client.emit(Wss.ClientEvent.LeaveCall, { callId });
  }

  sendMessage(roomId: number, ref: number, text: string) {
    this.client.emit(Wss.ClientEvent.SendMessage, { roomId, ref, text });
  }

  markMessageAsRead(msgId: number) {
    this.client.emit(Wss.ClientEvent.MarkMessageAsRead, { id: msgId });
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
