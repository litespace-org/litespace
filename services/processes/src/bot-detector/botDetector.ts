import fs from "node:fs";
import { Config } from "@/bot-detector/types";
import { ban, reset, start } from "@/bot-detector/actions";

const actions = [
  {
    name: "init",
    description: "create bot-detector.config.json file.",
  },
  {
    name: "start",
    description: "start the application in the watching mode.",
  },
  {
    name: "try",
    description: "start the application, detect bots, ban them, and exit.",
  },
  {
    name: "train",
    description:
      "supply the application with data; assign 'fishy' or 'normal' to the detected 'uncertain' urls.",
  },
  {
    name: "ban",
    description: "ban the detected bots so far.",
  },
  {
    name: "reset",
    description:
      "remove all state files (except `trained`) and unban the detected bots.",
  },
  {
    name: "help",
    description: "print the list of actions.",
  },
];

function printUsageMessage() {
  console.log("bot-detector actions:");
  for (const action of actions) {
    console.log("\t", action.name + ":\t", action.description);
  }
}

function getConfigFile(): Config {
  if (!fs.existsSync("./bot-detector.config.json")) {
    fs.writeFile(
      "./bot-detector.config.json",
      JSON.stringify({
        access_log: "./sample.log",
        bots: "./bots.json",
        trained: "./trained.json",
        uncertains: "./uncertains.json",
        threshold: 15,
        strikes: 10,
      }),
      "utf8",
      () => {}
    );
    console.log("config file has been initialized.");
  }
  return JSON.parse(fs.readFileSync("./bot-detector.config.json").toString());
}

const action = process.argv[2];

if (action === "init") {
  if (fs.existsSync("./bot-detector.config.json")) {
    console.warn("bot-detector.config.json already exists.");
    process.exit();
  }
  const config = getConfigFile();

  if (fs.existsSync(config.trained)) {
    console.warn(config.trained + " already exists.");
    process.exit();
  }
  fs.writeFile(config.trained, JSON.stringify({}), "utf8", () => {});
  process.exit();
} else if (action === "start") {
  const config = getConfigFile();
  start(config);
} else if (action === "try") {
  console.log("Not implemented yet!");
} else if (action === "train") {
  console.log("Not implemented yet!");
} else if (action === "ban") {
  const config = getConfigFile();
  ban(config);
} else if (action === "reset") {
  const config = getConfigFile();
  reset(config, () => {
    if (fs.existsSync(config.bots)) fs.rmSync(config.bots);
    if (fs.existsSync(config.uncertains)) fs.rmSync(config.uncertains);
    console.log("state files removed.");
  });
} else if (action === "help") {
  printUsageMessage();
  process.exit();
} else {
  console.error("Invalid usage.");
  printUsageMessage();
  process.exit();
}
