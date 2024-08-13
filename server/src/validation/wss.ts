import zod from "zod";
import { id } from "@/validation/utils";

const message = {
  send: zod.object({ roomId: id, text: zod.string() }),
  markMessageAsRead: zod.object({ id }),
} as const;

const call = {
  callHost: zod.object({
    offer: zod.object({ sdp: zod.string(), type: zod.literal("offer") }),
    hostId: id,
  }),
} as const;

export default {
  message,
  call,
};
