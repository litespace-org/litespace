export namespace Events {
  export enum Client {
    JoinRooms = "JoinRooms",
    SendMessage = "SendMessage",
    MarkAsRead = "MarkAsRead",
  }

  export enum Server {
    RoomMessage = "RoomMessage",
    JoinedRooms = "JoinedRooms",
    MessageRead = "MessageRead",
  }
}
