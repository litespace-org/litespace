import { io, Socket } from "socket.io-client";
import { sockets } from "@litespace/atlas";
import { Backend, Wss } from "@litespace/types";

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
      setTimeout(() => reject(new Error("TIMEOUT")), 1_000);
    });
  }
}
