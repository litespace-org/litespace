import { IMessage, IRule, ITutor } from "@/index";

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
  RuleDeleted = "RuleDeleted",
  RuleUpdated = "RuleUpdated",
  RuleCreated = "RuleCreated",
  InvoiceUpdated = "InvoiceUpdated",
  InvoiceDeleted = "InvoiceDeleted",
}

export enum Room {
  TutorsCache = "TutorsCache",
  AdminInvoices = "AdminInvoices",
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
  [ClientEvent.ToggleCamera]: EventCallback<{ call: number; camera: boolean }>;
  [ClientEvent.ToggleMic]: EventCallback<{ call: number; mic: boolean }>;
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
};
