import fs from "node:fs";
import { LogLine, LogLineData } from "@/bot-detector/types";

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

export class BotsCollection {
  private bots: string[] = [];
  private path: string;

  constructor(storePath: string) {
    this.path = storePath;
    if (fs.existsSync(storePath)) {
      // assumes storePath file is well formed
      const data = JSON.parse(fs.readFileSync(storePath).toString());
      this.bots = data;
      return;
    }
    this.save();
  }

  add(ip: string) {
    if (!this.bots.includes(ip)) {
      console.log("bot detected: ", ip);
      this.bots.push(ip);
      this.save();
    }
  }

  remove(ip: string) {
    this.bots.filter((item) => item !== ip);
    this.save();
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.bots));
  }

  /** TODO: implement this function.
   * this function should make ufw (ubuntu firewall) deny from
   * exatly the ips in this.bots list.
   */
  applyUFW() {}
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
