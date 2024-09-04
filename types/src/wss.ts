/**
 * Events emitted by the client
 */
export enum Client {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  MarkAsRead = "MarkAsRead",
  PeerOpened = "PeerOpened",
  UserSharingScreen = "UserSharingScreen",
}
/**
 * Events emitted by the server
 */
export enum Server {
  RoomMessage = "RoomMessage",
  JoinedRooms = "JoinedRooms",
  MessageRead = "MessageRead",
  UserJoinedCall = "UserJoinedCall",
  UserSharedScreen = "UserSharedScreen",
}
