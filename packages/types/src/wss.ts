/**
 * Events emitted by the client
 */
export enum ClientEvent {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  UpdateMessage = "UpdateMessage",
  DeleteMessage = "DeleteMessage",
  MarkAsRead = "MarkAsRead",
  PeerOpened = "PeerOpened",
  UserSharingScreen = "UserSharingScreen",
  ToggleCamera = "ToggleCamera",
  ToggleMic = "ToggleMic",
  Disconnect = "disconnect",
}

/**
 * Events emitted by the server
 */
export enum ServerEvent {
  RoomMessage = "RoomMessage",
  RoomMessageUpdated = "RoomMessageUpdated",
  RoomMessageDeleted = "RoomMessageDeleted",
  JoinedRooms = "JoinedRooms",
  MessageRead = "MessageRead",
  UserJoinedCall = "UserJoinedCall",
  UserSharedScreen = "UserSharedScreen",
  UserStatusChanged = "UserStatusChanged",
  CameraToggled = "CameraToggle",
  MicToggled = "MicToggled",
  TutorsCacheUpdated = "TutorsCacheUpdated",
  LessonBooked = "LessonBooked",
  LessonCanceled = "LessonCanceled",
  TutorUpdated = "TutorUpdated",
}

export enum Room {
  TutorsCache = "TutorsCache",
}
