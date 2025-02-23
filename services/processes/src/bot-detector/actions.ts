import fs from "node:fs";
import { Config, LogLine } from "@/bot-detector/types";
import {
  BotsCollection,
  parseLine,
  readLog,
  UncertainsCollection,
} from "@/bot-detector/utils";
import { Analyzer } from "@/bot-detector/analyzer";

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
function watchFileListener(filepath: string, callback?: (changes: LogLine[]) => void, firstInvoke?: boolean) {
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

export function start(config: Config) {
  const bots = new BotsCollection(config.bots);
  const uncertains = new UncertainsCollection(config.uncertains);

  const analyzer = new Analyzer();
  analyzer.setThreshold(Number(config.threshold));
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

  fs.watch(config.access_log, watchFileListener(config.access_log, callback, true));
  console.log("watching " + config.access_log);
}
