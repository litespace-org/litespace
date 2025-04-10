import { parentPort } from "node:worker_threads";
import { WorkerMessage } from "@/workers/types";
import { IToken } from "@litespace/types";
import {
  createSessionEvent,
  sendAuthTokenEmail,
  sendMessage,
  updateTutorCache,
} from "@/workers/handlers";

function _postMessage(message: WorkerMessage) {
  if (!parentPort) return;
  parentPort.postMessage(message);
}

parentPort?.on("message", async ({ type, payload }: WorkerMessage) => {
  if (
    type === "send-user-verification-email" ||
    type === "send-forget-password-email"
  ) {
    return await sendAuthTokenEmail({
      callbackUrl: payload.callbackUrl,
      email: payload.email,
      user: payload.user,
      type:
        type === "send-user-verification-email"
          ? IToken.Type.VerifyEmail
          : IToken.Type.ForgetPassword,
    });
  }

  if (type === "update-tutor-cache") return await updateTutorCache(payload);
  if (type === "create-session-event") return await createSessionEvent(payload);
  if (type == "send-message") return await sendMessage(payload);
});
