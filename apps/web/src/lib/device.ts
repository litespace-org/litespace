import {
  Device,
  DeviceManager,
  DeviceType,
  MediaTrack,
  AudioTrack,
  VideoTrack,
  CallError,
} from "@/modules/MediaCall/types";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";

export class WebDeviceManager implements DeviceManager {
  private devices: Device[] = [];
  private eh: ErrorHandler;

  constructor(eh?: ErrorHandler) {
    this.eh = eh || new ErrorHandler();
  }

  getDevices(): Device[] {
    return structuredClone(this.devices);
  }

  async detectDevices(): Promise<Device[]> {
    // TODO: make it more reliable: auto detect new devices
    if (this.devices.length > 0) return this.devices;

    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .catch(() => this.eh.throw(CallError.UserMediaAccessDenied));

    const devices = await navigator.mediaDevices.enumerateDevices();
    for (const d of devices) {
      this.devices.push({
        id: `${d.groupId}|${d.deviceId}`,
        name: d.label,
        type: this.mediaKindToDeviceType(d.kind),
      });
    }

    return this.devices;
  }

  async grantPermissionFor(device: Device): Promise<MediaTrack | null> {
    if (device.type === "unknown") throw Error("device type is unknown!");

    if (device.type === "mic") {
      const [groupId, deviceId] = device.id.split("|");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId, groupId },
      });
      const tracks = mediaStream.getTracks();
      return tracks[0];
    }

    if (device.type === "cam") {
      const [groupId, deviceId] = device.id.split("|");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId, groupId },
      });
      const tracks = mediaStream.getTracks();
      return tracks[0];
    }

    return null;
  }

  async grantMicPerm(): Promise<AudioTrack | null> {
    const devices = await this.detectDevices();
    const mic = devices.find((d) => d.type === "mic");
    if (!mic) throw Error("couldn't find mic device!");

    const track = await this.grantPermissionFor(mic);
    if (track?.kind !== "audio") return null;
    return track as AudioTrack;
  }

  async grantCamPerm(): Promise<VideoTrack | null> {
    const devices = await this.detectDevices();
    const cam = devices.find((d) => d.type === "cam");
    if (!cam) throw Error("couldn't find cam device!");

    const track = await this.grantPermissionFor(cam);
    if (track?.kind !== "video") return null;
    return track as VideoTrack;
  }

  async grantScreenPerm(): Promise<VideoTrack | null> {
    const devices = await this.detectDevices();
    const screen = devices.find((d) => d.type === "screen");
    if (!screen) throw Error("couldn't find screen media!");

    const track = await this.grantPermissionFor(screen);
    if (track?.kind !== "video") return null;
    return track as VideoTrack;
  }

  private mediaKindToDeviceType(kind: MediaDeviceKind): DeviceType {
    if (kind === "audioinput") return "mic";
    if (kind === "videoinput") return "cam";
    return "unknown";
  }
}
