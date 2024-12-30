import { IMessage, IRule, ITutor, Server, ICall } from "@/index";

/**
 * Events emitted by the client
 */
export enum ClientEvent {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  UpdateMessage = "UpdateMessage",
  DeleteMessage = "DeleteMessage",
  MarkMessageAsRead = "MarkMessageAsRead",
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
  RoomMessageRead = "RoomMessageRead",
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

export enum AcknowledgeCode {
  EmptyText = 'empty-text',
  RoomNotFound = 'room-not-found', 
  MessageNotFound = 'message-not-found',
  NotMember = 'not-member',
  NotOwner = 'not-owner',
  Unreachable = 'unreachable',
  Unallowed = 'unallowed',
  Ok = 'ok',
}

export type AcknowledgePayload = {
  code: AcknowledgeCode;
  message?: string;
}

export type AcknowledgeCallback = (payload?: AcknowledgePayload) => void;

type EventCallback<T> = (arg: T, callback?: AcknowledgeCallback) => Promise<void> | void;

/**
 * Events emitted by the client
 */
export type ClientEventsMap = {
  [ClientEvent.SendMessage]: EventCallback<{
    roomId: number;
    text: string;
  }>;
  [ClientEvent.UpdateMessage]: EventCallback<{ id: number; text: string }>;
  [ClientEvent.DeleteMessage]: EventCallback<{ id: number }>;
  [ClientEvent.MarkMessageAsRead]: EventCallback<{ id: number }>;

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
  [ServerEvent.RoomMessageRead]: EventCallback<{ userId: number }>;

  [ServerEvent.UserJoinedCall]: EventCallback<{ peerId: string }>;

  [ServerEvent.MemberJoinedCall]: EventCallback<{ userId: number }>;
  [ServerEvent.MemberLeftCall]: EventCallback<{ userId: number }>;

  [ServerEvent.CameraToggled]: EventCallback<{ user: number; camera: boolean }>;
  [ServerEvent.MicToggled]: EventCallback<{ user: number; mic: boolean }>;
  [ServerEvent.MessageRead]: EventCallback<{ messageId: number }>;
  [ServerEvent.UserStatusChanged]: EventCallback<{ 
    online: boolean, 
    userId: number, 
    roomId: number 
  }>;
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
