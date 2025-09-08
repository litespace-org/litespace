import { CallSession } from "./CallSession";
import { DeviceManager, AudioTrack, VideoTrack, Device } from "./types";

export class CallManager {
  protected session: CallSession;
  protected dm: DeviceManager;

  constructor(session: CallSession, dm: DeviceManager) {
    this.session = session;
    this.dm = dm;
  }

  get s() {
    return this.session;
  }

  async publishTrackFromDevice(deviceId: Device["id"]) {
    const devices = await this.dm.listDevices();
    const device = devices.find((d) => d.id === deviceId);
    if (!device) throw Error("device not found!");

    const track = await this.dm.grantPermissionFor(device);
    if (!track) throw Error("permission not granted!");

    if (device.type === "mic")
      this.session.getMemberByIndex(0)!.publishMicTrack(track as AudioTrack);
    else if (device.type === "cam")
      this.session.getMemberByIndex(0)!.publishCamTrack(track as VideoTrack);
    else if (device.type === "screen")
      this.session.getMemberByIndex(0)!.publishScreenTrack(track as VideoTrack);
  }
}
