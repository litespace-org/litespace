import { parentPort } from "node:worker_threads";
import {
  WorkerMessage,
  WorkerMessagePayloadMap,
  WorkerMessageType,
} from "@/workers/types";
import { IToken } from "@litespace/types";
import { sendAuthTokenEmail, updateTutorCache } from "@/workers/functions";

function _postMessage(message: WorkerMessage<WorkerMessageType>) {
  if (!parentPort) return;
  parentPort.postMessage(message);
}

parentPort?.on("message", async (message: WorkerMessage<WorkerMessageType>) => {
  if (
    message.type === "send-user-verification-email" ||
    message.type === "send-forget-password-email"
  ) {
    const payload =
      message.payload as WorkerMessagePayloadMap["send-forget-password-email"];
    return await sendAuthTokenEmail({
      callbackUrl: payload.callbackUrl,
      email: payload.email,
      user: payload.user,
      type:
        message.type === "send-user-verification-email"
          ? IToken.Type.VerifyEmail
          : IToken.Type.ForgetPassword,
    });
  }

  if (message.type === "update-tutor-in-cache") {
    const payload =
      message.payload as WorkerMessagePayloadMap["update-tutor-in-cache"];
    return await updateTutorCache(payload);
  }
});
