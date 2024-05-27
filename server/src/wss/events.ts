export namespace Events {
  export enum Client {
    JoinRooms = "JoinRooms",
    SendMessage = "SendMessage",
  }
  export enum Server {
    RoomMessage = "RoomMessage",
    JoinedRooms = "JoinedRooms",
  }
}
