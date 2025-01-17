import { isSessionId, logger, safe } from "@litespace/sol";
import { isGhost } from "@litespace/auth";
import { Wss } from "@litespace/types";
import { boolean } from "@/validation/utils";
import { WssHandler } from "@/wss/handlers/base";
import zod from "zod";
import { asSessionRoomId } from "../utils";

const toggleCameraPayload = zod.object({
  session: zod.string(),
  camera: boolean,
});
const toggleMicPayload = zod.object({ session: zod.string(), mic: boolean });

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

  async onToggleCamera(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { session, camera } = toggleCameraPayload.parse(data);

      if (!isSessionId(session))
        return this.call(callback, {
          code: Wss.AcknowledgeCode.InvalidSessionId,
          message: `${session} is not a valid session id`,
        });

      // todo: add validation
      this.broadcast(Wss.ServerEvent.CameraToggled, asSessionRoomId(session), {
        user: user.id,
        camera,
      });
    });
    if (error instanceof Error) stdout.error(error.message);
  }

  async onToggleMic(data: unknown, callback?: Wss.AcknowledgeCallback) {
    const error = safe(async () => {
      const user = this.user;
      if (isGhost(user)) return;
      const { session, mic } = toggleMicPayload.parse(data);

      if (!isSessionId(session))
        return this.call(callback, {
          code: Wss.AcknowledgeCode.InvalidSessionId,
          message: `${session} is not a valid session id`,
        });

      // todo: add validation
      this.broadcast(Wss.ServerEvent.MicToggled, asSessionRoomId(session), {
        user: user.id,
        mic,
      });
    });
    if (error instanceof Error) stdout.error(error.message);
  }
}
