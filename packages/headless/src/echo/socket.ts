import { sockets } from "@litespace/atlas";
import { Env, ISession } from "@litespace/types";
import { joinUrl } from "@litespace/utils";

/**
 * @ref services/echo/lib/wss/wss.go - ServerMessageType
 */
export enum ServerMessageType {
  Offer = 1,
  Answer = 2,
  Candidate = 3,
  MemberJoined = 4,
  MemberLeft = 5,
  ToggleVideo = 6,
  ToggleAudio = 7,
}

/**
 * @ref services/echo/lib/wss/wss.go - ClientMessageType
 */
export enum ClientMessageType {
  Offer = 1,
  Answer = 2,
  Candidate = 3,
  LeaveSession = 4,
  ToggleVideo = 5,
  ToggleAudio = 6,
}

type LocalEventType = "open" | "close" | "error";

type ServerMessageMap = {
  [ServerMessageType.Offer]: RTCSessionDescriptionInit;
  [ServerMessageType.Answer]: RTCSessionDescriptionInit;
  [ServerMessageType.Candidate]: RTCIceCandidateInit;
  [ServerMessageType.MemberJoined]: { mid: number };
  [ServerMessageType.MemberLeft]: { mid: number };
  [ServerMessageType.ToggleVideo]: { mid: number; video: boolean };
  [ServerMessageType.ToggleAudio]: { mid: number; audio: boolean };
  open: void;
  close: void;
  error: void;
};

type ClientMessageMap = {
  [ClientMessageType.Offer]: RTCSessionDescriptionInit;
  [ClientMessageType.Answer]: RTCSessionDescriptionInit;
  [ClientMessageType.Candidate]: RTCIceCandidateInit;
  [ClientMessageType.LeaveSession]: void;
  [ClientMessageType.ToggleVideo]: boolean;
  [ClientMessageType.ToggleAudio]: boolean;
  open: void;
  close: void;
  error: void;
};

export type ServerMessageValue<T extends ServerMessageType> =
  ServerMessageMap[T];

type UserCallback = {
  [P in keyof ServerMessageMap]: ServerMessageMap[P] extends void
    ? () => void
    : (value: ServerMessageMap[P]) => void;
};

type EventCallback = (event: Event) => void;

type Listeners = {
  [P in keyof ServerMessageMap]?: Map<UserCallback[P], EventCallback>;
};

export class Socket {
  private readonly socket: WebSocket;
  private readonly emitter: EventTarget;
  private listeners: Listeners;
  constructor(
    public readonly env: Env.Server,
    public readonly sessionId: ISession.Id,
    public readonly userId: number
  ) {
    const base = sockets.echo[env];
    const url = joinUrl(base, `/ws/${this.sessionId}/${this.userId}`);
    this.socket = new WebSocket(url);
    this.emitter = new EventTarget();
    this.listeners = {};
    this.init();
  }

  private init() {
    this.socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as {
        type: ServerMessageType;
        value: ServerMessageMap[ServerMessageType];
      };

      this.emitter.dispatchEvent(
        new CustomEvent(data.type.toString(), {
          detail: data.value || null,
        })
      );
    };

    this.socket.onopen = () => {
      this.emitter.dispatchEvent(new CustomEvent("open"));
    };

    this.socket.onclose = () => {
      this.emitter.dispatchEvent(new CustomEvent("close"));
    };

    this.socket.onerror = () => {
      this.emitter.dispatchEvent(new CustomEvent("error"));
    };
  }

  on<T extends ServerMessageType | LocalEventType>(
    type: T,
    callback: UserCallback[T]
  ) {
    const listener = (event: Event) => {
      const custom = event instanceof CustomEvent;
      if (!custom) return;
      const data = event.detail as ServerMessageMap[T];
      callback(data);
    };

    if (!this.listeners[type]) this.listeners[type] = new Map();
    this.listeners[type]?.set(callback, listener);

    this.emitter.addEventListener(type.toString(), listener);
  }

  off<T extends ServerMessageType | LocalEventType>(
    kind: T,
    callback: UserCallback[T]
  ) {
    const listener = this.listeners[kind]?.get(callback);
    if (!listener) return;
    this.emitter.removeEventListener(kind.toString(), listener);
  }

  close(code?: number, reason?: string) {
    this.socket.close(code, reason);
  }

  emit<T extends ClientMessageType>(kind: T, value: ClientMessageMap[T]) {
    const encodedValue = new TextEncoder().encode(JSON.stringify(value));
    const buffer = new Uint8Array([kind, ...encodedValue]);
    this.socket.send(buffer);
  }
}
