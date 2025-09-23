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
    if (!device) {
      this.eh.throw(CallError.TrackNotFound);
      throw Error(`CallError Code: ${CallError.TrackNotFound}`);
    }

    const track = await this.dm.grantPermissionFor(device).catch(() => {
      this.eh.throw(CallError.UserMediaAccessDenied);
      throw Error(`CallError Code: ${CallError.UserMediaAccessDenied}`);
    });

    if (!track) {
      this.eh.throw(CallError.TrackNotFound);
      throw Error(`CallError Code: ${CallError.TrackNotFound}`);
    }

    if (device.type === "mic")
      return this.session.curMember.publishMicTrack(track);
    if (device.type === "cam")
      return this.session.curMember.publishCamTrack(track);
    if (device.type === "screen")
      return this.session.curMember.publishScreenTrack(track);
  }
}
