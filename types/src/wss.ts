/**
 * Events emitted by the client
 */
export enum Client {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  UpdateMessage = "UpdateMessage",
  DeleteMessage = "DeleteMessage",
  MarkAsRead = "MarkAsRead",
  PeerOpened = "PeerOpened",
  UserSharingScreen = "UserSharingScreen",
}
/**
 * Events emitted by the server
 */
export enum Server {
  RoomMessage = "RoomMessage",
  RoomMessageUpdated = "RoomMessageUpdated",
  RoomMessageDeleted = "RoomMessageDeleted",
  JoinedRooms = "JoinedRooms",
  MessageRead = "MessageRead",
  UserJoinedCall = "UserJoinedCall",
  UserSharedScreen = "UserSharedScreen",
}
