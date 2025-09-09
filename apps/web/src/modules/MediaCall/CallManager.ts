import { CallSession } from "@/modules/MediaCall/CallSession";
import { DeviceManager, Device, CallError } from "@/modules/MediaCall/types";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";

export class CallManager {
  protected sess: CallSession;
  protected dm: DeviceManager;
  public eh: ErrorHandler;

  constructor(session: CallSession, dm: DeviceManager, eh: ErrorHandler) {
    this.sess = session;
    this.dm = dm;
    this.eh = eh;
  }

  get session() {
    return this.sess;
  }

  get media() {
    return this.dm;
  }

  async publishTrackFromDevice(deviceId: Device["id"], type: Device["type"]) {
    const devices = await this.dm.detectDevices();
    const device = devices.find((d) => d.id === deviceId && d.type === type);
    if (!device) return this.eh.throw(CallError.TrackNotFound);

    const track = await this.dm
      .grantPermissionFor(device)
      .catch(() => this.eh.throw(CallError.UserMediaAccessDenied));

    if (!track) return this.eh.throw(CallError.TrackNotFound);

    if (device.type === "mic") this.session.curMember.publishMicTrack(track);
    else if (device.type === "cam")
      this.session.curMember.publishCamTrack(track);
    else if (device.type === "screen")
      this.session.curMember.publishScreenTrack(track);
  }
}
