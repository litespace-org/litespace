import zod from "zod";
import { id } from "@/validation/utils";

const message = {
  send: zod.object({
    roomId: id,
    replyId: zod.optional(id),
    body: zod.string(),
  }),
} as const;

export default {
  message,
};
