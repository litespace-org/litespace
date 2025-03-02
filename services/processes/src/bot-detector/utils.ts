import fs from "node:fs";
import { Config, LogLine, LogLineData } from "@/bot-detector/types";
import { exec } from "node:child_process";

export function min(a: number, b: number): number {
  return a < b ? a : b;
}

/**
 * this function reads the log file and returns a list of its lines.
 */
export function readLog(logFilePath: string): LogLine[] {
  const content = fs.readFileSync(logFilePath);
  return content
    .toString()
    .split("\n")
    .filter((line) => line !== "");
}

/**
 * this function extracts data from a log line: ip address, request type,
 * and request endpoint.
 */
export function parseLine(logLine: LogLine): LogLineData {
  const [ip, ...rest] = logLine.split(" ");

  const restLine = rest.join(" ");
  const p1 = restLine.indexOf('"');
  const p2 = restLine.indexOf('"', p1 + 1);

  const [type, endpoint] = restLine.slice(p1 + 1, p2).split(" ");

  return {
    ip,
    type,
    endpoint,
  };
}

export async function execute(command: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stdout);
      return resolve(stdout);
    });
  });
}

/**\
 * this varialbe is used in watchFileListener to keep track of the changes.
 * `let` is prefered over `cost` for performance.
 */
let oldLog: LogLine[] = [];

/**
 * this function shall be used to generate the listener function for fs.watch method,
 * and invoke a callback function (its parameter) with passing a list of the changed lines
 * (precisely, the appended lines) as the value of the first parameter of the callback.
 */
export function watchFileListener(
  filepath: string,
  callback?: (changes: LogLine[]) => void,
  firstInvoke?: boolean
) {
  if (firstInvoke) {
    const newLog = readLog(filepath);
    if (newLog.length < oldLog.length) oldLog = newLog;

    const changes = newLog.slice(oldLog.length, newLog.length);
    oldLog.push(...changes);

    if (callback) callback(changes);
  }
  return function (event: fs.WatchEventType) {
    if (event === "change") {
      const newLog = readLog(filepath);
      if (newLog.length < oldLog.length) oldLog = newLog;

      const changes = newLog.slice(oldLog.length, newLog.length);
      oldLog.push(...changes);

      if (callback) callback(changes);
    }
  };
}

export class BotsCollection {
  private bots: Record<string, number>;
  private config: Config;
  private ufwFnTimeout: ReturnType<typeof setTimeout>;

  constructor(config: Config) {
    this.config = config;
    this.bots = {};
    if (fs.existsSync(config.bots)) {
      // NOTE: assumes storePath file is well formed
      const data = JSON.parse(fs.readFileSync(config.bots).toString());
      this.bots = data;
      this.applyUFW();
      return;
    }
    this.save();
  }

  add(ip: string) {
    if (!this.bots[ip]) {
      console.log("bot detected: ", ip);
      this.bots[ip] = 1;
      return this.save();
    }
    this.bots[ip] += 1;
    return this.save();
  }

  save() {
    fs.writeFileSync(this.config.bots, JSON.stringify(this.bots));
    if (this.ufwFnTimeout) clearTimeout(this.ufwFnTimeout);
    this.ufwFnTimeout = setTimeout(() => this.applyUFW(), 1000 * 5);
  }

  async applyUFW() {
    console.log("ufw: denying requests from the detected bots.");
    for (const ip in this.bots) {
      if (this.bots[ip] >= this.config.strikes)
        await execute("sudo ufw deny from " + ip);
    }
    console.log("ufw: done.");
  }
}

export class UncertainsCollection {
  private uncertains: string[] = [];
  private path: string;

  constructor(storePath: string) {
    this.path = storePath;
    if (fs.existsSync(storePath)) {
      // assumes storePath file is well formed
      const data = JSON.parse(fs.readFileSync(storePath).toString());
      this.uncertains = data;
      return;
    }
    this.save();
  }

  add(endpoint: string) {
    if (!this.uncertains.includes(endpoint)) {
      console.log("uncertain endpoint detected: ", endpoint);
      this.uncertains.push(endpoint);
      this.save();
      this.informDevs();
    }
  }

  remove(endpoint: string) {
    this.uncertains.filter((item) => item !== endpoint);
    this.save();
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.uncertains));
  }

  /** TODO: implement this function.
   * send the list in a telegram message
   */
  informDevs() {}
}
