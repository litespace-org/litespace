import { logger, safe } from "@litespace/sol";
import { rooms } from "@litespace/models";
import { isGhost } from "@litespace/auth";
import { Wss } from "@litespace/types";
import { id, boolean } from "@/validation/utils";
import { WSSHandler } from "./base";

import zod from "zod";
import { isEmpty } from "lodash";

const toggleCameraPayload = zod.object({ call: id, camera: boolean });
const toggleMicPayload = zod.object({ call: id, mic: boolean });
const userTypingPayload = zod.object({ roomId: zod.number() });

const stdout = logger("wss");

export class InputDevicesHandler extends WSSHandler {
  async toggleCamera(data: unknown) {
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

  async toggleMic(data: unknown) {
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

  async userTyping(data: unknown) {
    const error = safe(async () => {
      const { roomId } = userTypingPayload.parse(data);

      const user = this.user;
      if (isGhost(user)) return;

      const members = await rooms.findRoomMembers({ roomIds: [roomId] });
      if (isEmpty(members)) return;

      const isMember = members.find((member) => member.id === user.id);
      if (!isMember)
        throw new Error(`User(${user.id}) isn't member of room Id: ${roomId}`);

      this.socket.to(roomId.toString()).emit(Wss.ServerEvent.UserTyping, {
        roomId,
        userId: user.id,
      });
    });

    if (error instanceof Error) stdout.error(error.message);
  }
}
