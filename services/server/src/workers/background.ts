import { parentPort } from "node:worker_threads";
import {
  PartentPortMessageType,
  WorkerMessage,
  WorkerMessageType,
} from "@/workers/messages";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";
import { IToken, Server } from "@litespace/types";
import jwt from "jsonwebtoken";
import { jwtSecret } from "@/constants";
import { safe } from "@litespace/utils/error";
import { nameof } from "@litespace/utils/utils";
import pidusage from "pidusage";
import os from "node:os";
import v8 from "node:v8";
import { PartentPortMessage } from "@/workers/messages";

function postMessage(message: PartentPortMessage) {
  if (!parentPort) return;
  parentPort.postMessage(message);
}

async function sendAuthTokenEmail({
  email,
  user,
  callbackUrl,
  type,
}: {
  email: string;
  user: number;
  callbackUrl: string;
  type: IToken.Type.ForgetPassword | IToken.Type.VerifyEmail;
}) {
  const error = await safe(async () => {
    const payload: IToken.AuthTokenEmail = { type, user };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "30m" });
    const url = new URL(callbackUrl);
    url.searchParams.set("token", token);

    await emailer.send({
      to: email,
      template:
        type === IToken.Type.VerifyEmail
          ? EmailTemplate.VerifyEmail
          : EmailTemplate.ForgetPassword,
      props: { redirectUrl: url.toString() },
    });
  });

  if (error instanceof Error) console.error(nameof(sendAuthTokenEmail), error);
}

async function getServerStats(): Promise<Server.Stats> {
  const stats = await pidusage(process.pid);
  // Convert from B to MB
  // todo: make asMegaBytes util
  const memory = stats.memory / 1024 / 1024;
  const cpu = stats.cpu;
  const elapsed = stats.elapsed;
  const heap = v8.getHeapStatistics();
  const timestamp = Date.now();
  const load = os.loadavg();

  return {
    memory,
    cpu,
    elapsed,
    heap: {
      totalHeapSize: heap.total_heap_size / 1024 / 1024,
      totalPhysicalSize: heap.total_physical_size / 1024 / 1024,
      totalAvailableSize: heap.total_available_size / 1024 / 1024,
      usedHeapSize: heap.used_heap_size / 1024 / 1024,
      heapSizeLimit: heap.heap_size_limit / 1024 / 1024,
      numberOfNativeContexts: heap.number_of_native_contexts,
      numberOfDetachedContexts: heap.number_of_detached_contexts,
    },
    timestamp,
    load,
  };
}

parentPort?.on("message", async (message: WorkerMessage) => {
  if (
    message.type === WorkerMessageType.SendUserVerificationEmail ||
    message.type === WorkerMessageType.SendForgetPasswordEmail
  )
    return await sendAuthTokenEmail({
      callbackUrl: message.callbackUrl,
      email: message.email,
      user: message.user,
      type:
        message.type === WorkerMessageType.SendUserVerificationEmail
          ? IToken.Type.VerifyEmail
          : IToken.Type.ForgetPassword,
    });
});

// emit stats to the main thread
setInterval(async () => {
  postMessage({
    type: PartentPortMessageType.Stats,
    stats: await getServerStats(),
  });
}, 5_000);
