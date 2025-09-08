import { CallManager } from "@/modules/MediaCall/CallManager";
import { CallMember } from "@/modules/MediaCall/CallMember";
import { 
  Device,
  DeviceManager,
  DeviceType,
  MediaTrack,
  AudioTrack,
  VideoTrack
} from "@/modules/MediaCall/types";
import { Room, RoomEvent } from "livekit-client";

export class WebDeviceManager implements DeviceManager {
  private devices: Device[] = [];

  async listDevices(): Promise<Device[]> {
    if (this.devices.length > 0)
      return this.devices;

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
    if (device.type === "unknown")
      throw Error("device type is unknown!");

    if (device.type === "mic") {
      const [groupId, deviceId] = device.id.split('|');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId, groupId },
      });
      const tracks = mediaStream.getTracks();
      return tracks[0];
    }

    if (device.type === "cam") {
      const [groupId, deviceId] = device.id.split('|');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId, groupId },
      });
      const tracks = mediaStream.getTracks();
      return tracks[0];
    }

    return null;
  }

  async grantMicPerm(): Promise<AudioTrack | null> {
    const devices = await this.listDevices();
    const mic = devices.find(d => d.type === "mic");
    if (!mic) throw Error("couldn't find mic device!");
    
    const track = await this.grantPermissionFor(mic);
    if (track?.kind !== "audio") return null;
    return track as AudioTrack;
  }

  async grantCamPerm(): Promise<VideoTrack | null> {
    const devices = await this.listDevices();
    const cam = devices.find(d => d.type === "cam");
    if (!cam) throw Error("couldn't find cam device!");
    
    const track = await this.grantPermissionFor(cam);
    if (track?.kind !== "video") return null;
    return track as VideoTrack;
  }

  async grantScreenPerm(): Promise<VideoTrack | null> {
    const devices = await this.listDevices();
    const screen = devices.find(d => d.type === "screen");
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

export class LivekitCallManager extends CallManager {
  private room: Room;

  constructor(memberIds: Array<CallMember["id"]>, dm: DeviceManager) {
    super(memberIds, dm);
    this.room = new Room({
      // Optimize video quality for each participant's screen
      adaptiveStream: true,
      // Enable automatic audio/video quality optimization
      dynacast: true,
      disconnectOnPageLeave: true,
    });

    this.room.on(RoomEvent.Connected, () => this.onMemberConnect(memberIds[0]));
    this.room.on(RoomEvent.Disconnected, () => this.onMemberDisconnect(memberIds[0]));
    this.room.on(RoomEvent.ParticipantConnected, (p) => this.onMemberConnect(p.identity));
    this.room.on(RoomEvent.ParticipantDisconnected, (p) => this.onMemberDisconnect(p.identity));
  }

  connect(sessionId: string, lkAccessToken: string) {
    this.room.connect(sessionId, lkAccessToken); 
  }

  disconnect() {
    this.room.disconnect();
  }

  onMemberConnect(memberId: CallMember["id"]): void {
    if (!this.session.getMember(memberId)) {
      this.session.addMember(new CallMember(memberId, this.dm));
    }
    super.onMemberConnect(memberId);
  }
}

export function makeCall(memberIds: Array<CallMember["id"]>): LivekitCallManager {
  return new LivekitCallManager(memberIds, new WebDeviceManager());
}
