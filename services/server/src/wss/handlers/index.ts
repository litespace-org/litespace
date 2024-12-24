import { Socket } from "socket.io";
import { IUser } from "@litespace/types";

import { Session } from "@/wss/handlers/session";
import { Connection } from "@/wss/handlers/connection";
import { Messages } from "@/wss/handlers/message";
import { Peer } from "@/wss/handlers/peer";
import { InputDevices } from "./inputDevices";

export class WssHandlers {
  public readonly connection: Connection;
  public readonly session: Session;
  public readonly messages: Messages;
  public readonly peer: Peer;
  public readonly inputDevices: InputDevices;

  constructor(socket: Socket, user: IUser.Self | IUser.Ghost) {
    this.connection = new Connection(socket, user).init();
    this.session = new Session(socket, user).init();
    this.messages = new Messages(socket, user).init();
    this.peer = new Peer(socket, user);
    this.inputDevices = new InputDevices(socket, user).init();
  }
}
