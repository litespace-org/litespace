import fs from "node:fs";
import { Config } from "@/bot-detector/types";
import { start } from "@/bot-detector/actions";

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
    name: "reset",
    description: "unban all detected ips and remove them from state files.",
  },
  {
    name: "help",
    description: "prints the list of actions.",
  }
]

function printUsageMessage() {
  console.log("bot-detector actions:")
  for (const action of actions) {
    console.log("\t", action.name + ":\t", action.description)
  }
}

function getConfigFile(): Config  {
  if (!fs.existsSync("./bot-detector.config.json")) {
    console.error("bot-detector.config.json not found!");
    console.log("use 'bot-detector init' action to create it.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync("./bot-detector.config.json").toString())
}

const action = process.argv[2];

let config: Config = {
  access_log: "./sample.log",
  bots: "./bots.json",
  uncertains: "./uncertains.json",
  threshold: 15,
  strikes: 10,
}

if (action === "init") {
  if (fs.existsSync("./bot-detector.config.json")) {
    console.error("bot-detector.config.json already exists.");
    process.exit();
  }
  fs.writeFile("./bot-detector.config.json", JSON.stringify(config), "utf8", () => {});
  process.exit();
}
else if (action === "start") {
  const config = getConfigFile();
  start(config);
}
else if (action === "try") {
  const config = getConfigFile();
  console.log(config);
}
else if (action === "reset") {
  const config = getConfigFile();
  console.log(config);
}
else if (action === "help") {
  printUsageMessage();
  process.exit();
}
else {
  console.error("Invalid usage.");
  printUsageMessage();
  process.exit();
}

