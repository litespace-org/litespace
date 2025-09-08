export type DeviceType = "mic" | "cam" | "screen" | "unknown";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
};

export interface AudioTrack extends MediaStreamTrack {
  readonly kind: "audio";
}

export interface VideoTrack extends MediaStreamTrack {
  readonly kind: "video";
}

export interface MediaTrack extends MediaStreamTrack {}

export type MemberTracks = {
  mic?: AudioTrack;
  cam?: VideoTrack;
  screen?: VideoTrack;
};

export interface DeviceManager {
  listDevices(): Device[] | Promise<Device[]>;
  grantPermissionFor(device: Device): Promise<MediaTrack | null>;
  grantMicPerm(): Promise<AudioTrack | null>;
  grantCamPerm(): Promise<VideoTrack | null>;
  grantScreenPerm(): Promise<VideoTrack | null>;
}
