import { EmptyObject, IMessage, ISession, ITutor, Server } from "@/index";
import { SessionDescription } from "@/webrtc";

/**
 * Events emitted by the client
 */
export enum ClientEvent {
  JoinRooms = "JoinRooms",
  SendMessage = "SendMessage",
  UpdateMessage = "UpdateMessage",
  DeleteMessage = "DeleteMessage",
  MarkMessageAsRead = "MarkMessageAsRead",
  PreJoinSession = "PreJoinSession",
  JoinSession = "JoinSession",
  LeaveSession = "LeaveSession",
  SessionOffer = "SessionOffer",
  SessionAnswer = "SessionAnswer",
  AnnounceIncomingOffer = "AnnounceIncomingOffer",
  PeerReadyToReceiveOffer = "ReadyToReceiveOffer",
  IceCandidate = "IceCandidate",
  PingSessionMember = "PingSessionMember",
  PongSessionMember = "PongSessionMember",

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

  MemberJoinedSession = "MemberJoinedSessionId",
  MemberLeftSession = "MemberLeftSessionId",
  SessionOffer = "SessionOffer",
  SessionAnswer = "SessionAnswer",
  IceCandidate = "IceCandidate",
  PingSessionMember = "PingSessionMember",
  PongSessionMember = "PongSessionMember",
  AnnounceIncomingOffer = "AnnounceIncomingOffer",
  PeerReadyToReceiveOffer = "ReadyToReceiveOffer",
  UserJoinedSession = "UserJoinedSession",

  /**
   * @deprecated
   */
  UserSharedScreen = "UserSharedScreen",
  UserStatusChanged = "UserStatusChanged",
  UserTyping = "UserTyping",

  CameraToggled = "CameraToggle",
  MicToggled = "MicToggled",

  TutorsCacheUpdated = "TutorsCacheUpdated",
  TutorUpdated = "TutorUpdated",

  LessonBooked = "LessonBooked",
  LessonRebooked = "LessonRebooked",
  LessonCanceled = "LessonCanceled",

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
  EmptyText = "empty-text",
  RoomNotFound = "room-not-found",
  MessageNotFound = "message-not-found",
  LessonNotFound = "lesson-not-found",
  InterviewNotFound = "interview-not-found",
  NotMember = "not-member",
  NotOwner = "not-owner",
  Unreachable = "unreachable",
  Unallowed = "unallowed",
  InvalidSessionId = "invalid-session-id",
  Ok = "ok",
}

export type AcknowledgePayload = {
  code: AcknowledgeCode;
  message?: string;
};

export type AcknowledgeCallback = (payload?: AcknowledgePayload) => void;

type EventCallback<T> = (
  arg: T,
  callback?: AcknowledgeCallback
) => Promise<void> | void;

/**
 * Events emitted by the client
 */
export type ClientEventsMap = {
  [ClientEvent.SendMessage]: EventCallback<{
    roomId: number;
    text: string;
    refId: string;
  }>;
  [ClientEvent.UpdateMessage]: EventCallback<{ id: number; text: string }>;
  [ClientEvent.DeleteMessage]: EventCallback<{ id: number }>;
  [ClientEvent.MarkMessageAsRead]: EventCallback<{ id: number }>;

  [ClientEvent.PeerOpened]: EventCallback<{
    sessionId: ISession.Id;
    peerId: string;
  }>;
  [ClientEvent.RegisterPeer]: EventCallback<{ peer: string }>;

  [ClientEvent.ToggleCamera]: EventCallback<{
    session: ISession.Id;
    camera: boolean;
  }>;
  [ClientEvent.ToggleMic]: EventCallback<{
    session: ISession.Id;
    mic: boolean;
  }>;

  [ClientEvent.UserTyping]: EventCallback<{ roomId: number }>;
  [ClientEvent.PreJoinSession]: EventCallback<{ sessionId: ISession.Id }>;
  [ClientEvent.JoinSession]: EventCallback<{ sessionId: ISession.Id }>;
  [ClientEvent.LeaveSession]: EventCallback<{ sessionId: ISession.Id }>;
  [ClientEvent.SessionOffer]: EventCallback<{
    sessionId: ISession.Id;
    offer: SessionDescription;
  }>;
  [ClientEvent.SessionAnswer]: EventCallback<{
    sessionId: ISession.Id;
    answer: RTCSessionDescriptionInit;
  }>;
  [ClientEvent.IceCandidate]: EventCallback<{
    sessionId: ISession.Id;
    candidate: RTCIceCandidateInit;
  }>;
  [ClientEvent.PingSessionMember]: EventCallback<{
    sessionId: ISession.Id;
    userId: number;
  }>;
  [ClientEvent.PongSessionMember]: EventCallback<{
    sessionId: ISession.Id;
    userId: number;
  }>;
  [ClientEvent.AnnounceIncomingOffer]: EventCallback<{
    sessionId: ISession.Id;
  }>;
  [ClientEvent.PeerReadyToReceiveOffer]: EventCallback<{
    sessionId: ISession.Id;
  }>;
};

/**
 * Events emitted by the server
 */
export type ServerEventsMap = {
  [ServerEvent.RoomMessage]: EventCallback<IMessage.Self & { refId: string }>;
  [ServerEvent.RoomMessageUpdated]: EventCallback<IMessage.Self>;
  [ServerEvent.RoomMessageDeleted]: EventCallback<{
    roomId: number;
    messageId: number;
  }>;
  [ServerEvent.RoomMessageRead]: EventCallback<{
    userId: number;
    messageId: number;
    roomId: number;
  }>;

  [ServerEvent.UserJoinedSession]: EventCallback<{ peerId: string }>;

  [ServerEvent.MemberJoinedSession]: EventCallback<{ userId: number }>;
  [ServerEvent.MemberLeftSession]: EventCallback<{ userId: number }>;

  [ServerEvent.CameraToggled]: EventCallback<{ user: number; camera: boolean }>;
  [ServerEvent.MicToggled]: EventCallback<{ user: number; mic: boolean }>;
  [ServerEvent.MessageRead]: EventCallback<{ messageId: number }>;
  [ServerEvent.UserStatusChanged]: EventCallback<{
    online: boolean;
    userId: number;
    roomId: number;
  }>;
  [ServerEvent.InvoiceUpdated]: EventCallback<void>;
  [ServerEvent.InvoiceDeleted]: EventCallback<void>;
  [ServerEvent.LessonBooked]: EventCallback<{
    tutor: number;
    lesson: number;
  }>;
  [ServerEvent.LessonRebooked]: EventCallback<{
    tutor: number;
    lesson: number;
  }>;
  [ServerEvent.LessonCanceled]: EventCallback<{
    tutor: number;
    lesson: number;
  }>;
  [ServerEvent.TutorUpdated]: EventCallback<ITutor.FullTutor>;
  [ServerEvent.ServerStats]: EventCallback<Server.Stats>;
  [ServerEvent.UserTyping]: EventCallback<{ roomId: number; userId: number }>;
  [ServerEvent.SessionOffer]: EventCallback<{
    offer: SessionDescription;
  }>;
  [ServerEvent.SessionAnswer]: EventCallback<{
    answer: RTCSessionDescriptionInit;
  }>;
  [ServerEvent.IceCandidate]: EventCallback<{
    candidate: RTCIceCandidateInit;
  }>;
  [ServerEvent.PingSessionMember]: EventCallback<{
    userId: number;
  }>;
  [ServerEvent.PongSessionMember]: EventCallback<{
    userId: number;
  }>;
  [ServerEvent.AnnounceIncomingOffer]: EventCallback<EmptyObject>;
  [ServerEvent.PeerReadyToReceiveOffer]: EventCallback<EmptyObject>;
};

// Generic types to extract the payload of the events
type EventCallbackPayload<T> = T extends EventCallback<infer P> ? P : never;

export type EventPayload<
  T extends keyof ClientEventsMap | keyof ServerEventsMap,
> = T extends keyof ClientEventsMap
  ? EventCallbackPayload<ClientEventsMap[T]>
  : T extends keyof ServerEventsMap
    ? EventCallbackPayload<ServerEventsMap[T]>
    : never;
