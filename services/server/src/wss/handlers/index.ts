import { Socket } from "socket.io";
import { CallHandler } from "./call";
import { IUser } from "@litespace/types";

export class WSSHandlers {
  public readonly call: CallHandler;

  constructor(socket: Socket, user: IUser.Self | IUser.Ghost) {
    this.call = new CallHandler(socket, user);
  }
}
