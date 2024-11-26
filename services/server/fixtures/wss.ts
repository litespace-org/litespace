import { io, Socket } from "socket.io-client";
import { sockets, TokenType } from "@litespace/atlas";
import { Backend, Wss } from "@litespace/types";
import { safe } from "@litespace/sol/error";
import { rooms } from "@litespace/models";

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
}
