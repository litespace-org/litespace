import { Socket } from "socket.io";
import { IUser } from "@litespace/types";

import { CallHandler } from "./call";
import { ConnectionHandler } from "./connection";
import { MessageHandler } from "./message";
import { PeerHandler } from "./peer";
import { InputDevicesHandler } from "./inputDevices";

export class WSSHandlers {
  public readonly connection: ConnectionHandler;
  public readonly call: CallHandler;
  public readonly message: MessageHandler;
  public readonly peer: PeerHandler;
  public readonly inputDevices: InputDevicesHandler;

  constructor(socket: Socket, user: IUser.Self | IUser.Ghost) {
    this.connection = new ConnectionHandler(socket, user);
    this.call = new CallHandler(socket, user);
    this.message = new MessageHandler(socket, user);
    this.peer = new PeerHandler(socket, user);
    this.inputDevices = new InputDevicesHandler(socket, user);
  }
}
