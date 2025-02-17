import fs from "node:fs";
import { LogLine } from "@/bot-detector/types";
import {
  BotsCollection,
  parseLine,
  readLog,
  UncertainsCollection,
} from "@/bot-detector/utils";
import { Analyzer } from "@/bot-detector/analyzer";
import { program } from "commander";

program.option("--log <string>", "log file path", "./sample.log");
program.option("--bots <string>", "bots file path", "./bots.json");
program.option(
  "--uncertains <string>",
  "uncertains file path",
  "./uncertains.json"
);
program.option("--threshold <number>", "analyzer threshold file path", "15");
program.parse();
const options = program.opts();

const LOG_FILE_PATH = options.log;

const bots = new BotsCollection(options.bots);
const uncertains = new UncertainsCollection(options.uncertains);

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
function watchFileListener(callback?: (changes: LogLine[]) => void) {
  return function (event: fs.WatchEventType) {
    if (event === "change") {
      const newLog = readLog(LOG_FILE_PATH);
      if (newLog.length < oldLog.length) oldLog = newLog;

      const changes = newLog.slice(oldLog.length, newLog.length);
      oldLog.push(...changes);

      if (callback) callback(changes);
    }
  };
}

function start() {
  const analyzer = new Analyzer();
  analyzer.setThreshold(Number(options.threshold));
  analyzer.load();

  function callback(changes: LogLine[]) {
    for (const change of changes) {
      const parsedLine = parseLine(change);
      const conn = analyzer.predict(parsedLine);
      if (conn === "fishy") bots.add(parsedLine.ip);
      if (conn === "uncertain")
        uncertains.add(parsedLine.type + " " + parsedLine.endpoint);
    }
    fs.watch(LOG_FILE_PATH, watchFileListener(callback));
  }

  fs.watch(LOG_FILE_PATH, watchFileListener(callback));
  console.log("watching " + LOG_FILE_PATH);
}

start();
