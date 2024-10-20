import path from "node:path";
import { Worker } from "node:worker_threads";
import { WorkerMessage } from "@/workers/messages";

export const background = new Worker(path.join(__dirname, "background.js"));

export function sendBackgroundMessage(message: WorkerMessage) {
  background.postMessage(message);
}
