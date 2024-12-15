import { logger, safe } from "@litespace/sol";
import { rooms } from "@litespace/models";
import { isGhost } from "@litespace/auth";
import { Wss } from "@litespace/types";
import { id, boolean } from "@/validation/utils";
import { WssHandler } from "@/wss/handlers/base";
import zod from "zod";
import { isEmpty } from "lodash";

const toggleCameraPayload = zod.object({ call: id, camera: boolean });
const toggleMicPayload = zod.object({ call: id, mic: boolean });

const stdout = logger("wss");

export class InputDevices extends WssHandler {
  public init(): InputDevices {
    this.socket.on(
      Wss.ClientEvent.ToggleCamera,
      this.onToggleCamera.bind(this)
    );
    this.socket.on(Wss.ClientEvent.ToggleMic, this.onToggleMic.bind(this));
    return this;
  }

  async onToggleCamera(data: unknown) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { call, camera } = toggleCameraPayload.parse(data);
      // todo: add validation
      this.broadcast(Wss.ServerEvent.CameraToggled, call.toString(), {
        user: user.id,
        camera,
      });
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async onToggleMic(data: unknown) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { call, mic } = toggleMicPayload.parse(data);
      // todo: add validation
      this.broadcast(Wss.ServerEvent.MicToggled, call.toString(), {
        user: user.id,
        mic,
      });
    });
    if (error instanceof Error) stdout.error(error.message);
  }
}
