import path from "node:path";
import { Worker } from "node:worker_threads";
import { WorkerMessage } from "@/workers/messages";
import { serverConfig } from "@/constants";

export const background = new Worker(
  path.join(serverConfig.build, "workers/background.js")
);

export function sendBackgroundMessage(message: WorkerMessage) {
  background.postMessage(message);
}
