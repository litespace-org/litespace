import { IUser, Wss } from "@litespace/types";
import { Socket } from "socket.io";

export abstract class WSSHandler {
  protected readonly socket: Socket;
  protected readonly user: IUser.Self | IUser.Ghost;

  constructor(socket: Socket, user: IUser.Self | IUser.Ghost) {
    this.socket = socket;
    this.user = user;
  }

  protected async broadcast<T extends keyof Wss.ServerEventsMap>(
    event: T,
    room: string,
    ...data: Parameters<Wss.ServerEventsMap[T]>
  ) {
    this.socket.emit(event, ...data);
    this.socket.broadcast.to(room).emit(event, ...data);
  }
}
