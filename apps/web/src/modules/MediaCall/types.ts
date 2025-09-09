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
  listDevices(): Promise<Device[]>;
  grantPermissionFor(device: Device): Promise<MediaTrack | null>;
  grantMicPerm(): Promise<AudioTrack | null>;
  grantCamPerm(): Promise<VideoTrack | null>;
  grantScreenPerm(): Promise<VideoTrack | null>;
}
