import { IMessage, IRule, ITutor, Server, ICall } from "@/index";

/**
 * Events emitted by the client
 */
export enum ClientEvent {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  UpdateMessage = "UpdateMessage",
  DeleteMessage = "DeleteMessage",
  MarkAsRead = "MarkAsRead",
  JoinCall = "JoinCall",
  LeaveCall = "LeaveCall",
  /**
   * @deprecated
   */
  PeerOpened = "PeerOpened",
  RegisterPeer = "RegisterPeer",
  UserSharingScreen = "UserSharingScreen",
  ToggleCamera = "ToggleCamera",
  ToggleMic = "ToggleMic",
  Disconnect = "disconnect",
  UserTyping = "UserTyping",
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

  MemberJoinedCall = "MemberJoinedCallId",
  MemberLeftCall = "MemberLeftCallId",

  /**
   * @deprecated
   */
  UserJoinedCall = "UserJoinedCall",
  UserSharedScreen = "UserSharedScreen",
  UserStatusChanged = "UserStatusChanged",
  UserTyping = "UserTyping",

  CameraToggled = "CameraToggle",
  MicToggled = "MicToggled",

  TutorsCacheUpdated = "TutorsCacheUpdated",
  TutorUpdated = "TutorUpdated",

  LessonBooked = "LessonBooked",
  LessonCanceled = "LessonCanceled",

  RuleDeleted = "RuleDeleted",
  RuleUpdated = "RuleUpdated",
  RuleCreated = "RuleCreated",

  InvoiceUpdated = "InvoiceUpdated",
  InvoiceDeleted = "InvoiceDeleted",

  ServerStats = "ServerStats",
}

export enum Room {
  TutorsCache = "TutorsCache",
  AdminInvoices = "AdminInvoices",
  ServerStats = "ServerStats",
}

type EventCallback<T> = (arg: T) => Promise<void> | void;

/**
 * Events emitted by the client
 */
export type ClientEventsMap = {
  [ClientEvent.SendMessage]: EventCallback<{ roomId: number; text: string }>;
  [ClientEvent.UpdateMessage]: EventCallback<{ id: number; text: string }>;
  [ClientEvent.DeleteMessage]: EventCallback<{ id: number }>;
  [ClientEvent.PeerOpened]: EventCallback<{ callId: number; peerId: string }>;
  [ClientEvent.RegisterPeer]: EventCallback<{ peer: string }>;
  [ClientEvent.ToggleCamera]: EventCallback<{ call: number; camera: boolean }>;
  [ClientEvent.ToggleMic]: EventCallback<{ call: number; mic: boolean }>;
  [ClientEvent.UserTyping]: EventCallback<{ roomId: number }>;
  [ClientEvent.JoinCall]: EventCallback<{
    callId: number;
    type: ICall.Type;
  }>;
  [ClientEvent.LeaveCall]: EventCallback<{ callId: number }>;
};

/**
 * Events emitted by the server
 */
export type ServerEventsMap = {
  [ServerEvent.RoomMessage]: EventCallback<IMessage.Self>;
  [ServerEvent.RoomMessageUpdated]: EventCallback<IMessage.Self>;
  [ServerEvent.RoomMessageDeleted]: EventCallback<{
    roomId: number;
    messageId: number;
  }>;

  [ServerEvent.UserJoinedCall]: EventCallback<{ peerId: string }>;

  [ServerEvent.MemberJoinedCall]: EventCallback<{ userId: number }>;
  [ServerEvent.MemberLeftCall]: EventCallback<{ userId: number }>;

  [ServerEvent.CameraToggled]: EventCallback<{ user: number; camera: boolean }>;
  [ServerEvent.MicToggled]: EventCallback<{ user: number; mic: boolean }>;
  [ServerEvent.MessageRead]: EventCallback<{ messageId: number }>;
  [ServerEvent.UserStatusChanged]: EventCallback<{ online: boolean }>;
  [ServerEvent.InvoiceUpdated]: EventCallback<void>;
  [ServerEvent.InvoiceDeleted]: EventCallback<void>;
  [ServerEvent.LessonBooked]: EventCallback<{
    tutor: number;
    rule: number;
    events: IRule.RuleEvent[];
  }>;
  [ServerEvent.LessonCanceled]: EventCallback<{
    tutor: number;
    rule: number;
    events: IRule.RuleEvent[];
  }>;
  [ServerEvent.RuleCreated]: EventCallback<void>;
  [ServerEvent.RuleUpdated]: EventCallback<void>;
  [ServerEvent.RuleDeleted]: EventCallback<void>;
  [ServerEvent.TutorUpdated]: EventCallback<ITutor.FullTutor>;
  [ServerEvent.ServerStats]: EventCallback<Server.Stats>;
  [ServerEvent.UserTyping]: EventCallback<{ roomId: number; userId: number }>;
};
