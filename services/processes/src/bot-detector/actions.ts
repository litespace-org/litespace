import fs from "node:fs";
import { Config, LogLine } from "@/bot-detector/types";
import {
  BotsCollection,
  execute,
  parseLine,
  UncertainsCollection,
  watchFileListener,
} from "@/bot-detector/utils";
import { Analyzer } from "@/bot-detector/analyzer";

export function start(config: Config) {
  const bots = new BotsCollection(config);
  const uncertains = new UncertainsCollection(config.uncertains);

  const analyzer = new Analyzer(config);
  analyzer.load();

  function callback(changes: LogLine[]) {
    for (const change of changes) {
      const parsedLine = parseLine(change);
      const conn = analyzer.predict(parsedLine);
      if (conn === "fishy") bots.add(parsedLine.ip);
      if (conn === "uncertain")
        uncertains.add(parsedLine.type + " " + parsedLine.endpoint);
    }
    fs.watch(config.access_log, watchFileListener(config.access_log, callback));
  }

  fs.watch(
    config.access_log,
    watchFileListener(config.access_log, callback, true)
  );
  console.log("watching " + config.access_log);
}

export async function ban(config: Config, callback?: () => void) {
  const bots = JSON.parse(fs.readFileSync(config.bots).toString());
  console.log("ufw: denying requests from the detected bots.");
  for (const ip in bots) {
    if (bots[ip] >= config.strikes) {
      const res = await execute("sudo ufw deny from " + ip);
      console.log(res);
    }
  }
  console.log("ufw: done.");
  if (callback) callback();
}

export async function reset(config: Config, callback?: () => void) {
  const bots = JSON.parse(fs.readFileSync(config.bots).toString());
  for (const ip in bots) {
    if (bots[ip] >= config.strikes) {
      const res = await execute("echo 'y' | sudo ufw delete 1");
      console.log(res);
    }
  }
  console.log("ufw: all ips allowed.");
  if (callback) callback();
}
