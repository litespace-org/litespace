export type DeviceType = "mic" | "cam" | "screen" | "unknown";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
};

export type AudioTrack = MediaStreamTrack;

export type VideoTrack = MediaStreamTrack;

export type MediaTrack = MediaStreamTrack;

export type MemberTracks = {
  mic?: AudioTrack;
  cam?: VideoTrack;
  screen?: VideoTrack;
};

export interface DeviceManager {
  getDevices(): Device[];
  detectDevices(): Promise<Device[]>;
  grantPermissionFor(device: Device): Promise<MediaTrack | null>;
  grantMicPerm(): Promise<AudioTrack | null>;
  grantCamPerm(): Promise<VideoTrack | null>;
  grantScreenPerm(): Promise<VideoTrack | null>;
}

export enum CallError {
  IndexOutOfRange = 1,
  CannotRemoveJoinedMember,
  NotAllowedToJoinSession,
  MemberAlreadyInSession,
  FullSession,
  TrackNotFound,
  UserMediaAccessDenied,
  MicNotFound,
  CamNotFound,
}

export const CallErrorMessage: Record<CallError, string> = Object.freeze({
  [CallError.IndexOutOfRange]: "index out of range.",
  [CallError.CannotRemoveJoinedMember]: "cannot remove a joined member.",
  [CallError.NotAllowedToJoinSession]: "not allowed to join the session.",
  [CallError.MemberAlreadyInSession]: "the member is already in the session!",
  [CallError.FullSession]: "the session is full!",
  [CallError.TrackNotFound]: "no track found!",
  [CallError.UserMediaAccessDenied]: "counldn't get access to user media.",
  [CallError.MicNotFound]: "cannot find a mic device.",
  [CallError.CamNotFound]: "cannot find a cam device",
});
