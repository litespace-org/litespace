import path from "node:path";
import { Worker } from "node:worker_threads";
import "colors";

export function initWorker(name: string) {
  const location = path.join(__dirname, name);
  const worker = new Worker(location);

  worker.on("message", (message) => {
    console.log({ src: name, message });
  });

  worker.on("error", (error) => {
    console.error(`${name}:`, error);
  });

  worker.on("online", () => {
    console.log(`${name} is online`.green);
  });

  worker.on("exit", (code) => {
    console.log(`${name} exited with ${code}`);
  });
}
