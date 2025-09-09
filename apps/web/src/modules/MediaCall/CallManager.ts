import { CallSession } from "./CallSession";
import { DeviceManager, Device } from "./types";

export class CallManager {
  protected sess: CallSession;
  protected dm: DeviceManager;

  constructor(session: CallSession, dm: DeviceManager) {
    this.sess = session;
    this.dm = dm;
  }

  get session() {
    return this.sess;
  }

  get media() {
    return this.dm;
  }

  async publishTrackFromDevice(deviceId: Device["id"]) {
    const devices = await this.dm.listDevices();
    const device = devices.find((d) => d.id === deviceId);
    if (!device) throw Error("device not found!");

    const track = await this.dm.grantPermissionFor(device);
    if (!track) throw Error("permission not granted!");

    if (device.type === "mic") this.session.curMember.publishMicTrack(track);
    else if (device.type === "cam")
      this.session.curMember.publishCamTrack(track);
    else if (device.type === "screen")
      this.session.curMember.publishScreenTrack(track);
  }
}
