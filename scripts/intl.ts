import fs from "node:fs";
import { glob } from "glob";
import "colors";
import { Command } from "commander";
import { omit } from "lodash";

async function findUnusedIds() {
  const local = JSON.parse(
    fs.readFileSync("./packages/ui/src/locales/ar-eg.json").toString("utf-8")
  );
  const files = await glob("{packages,apps}/**/*.{js,ts,jsx,tsx}", {
    posix: true,
    ignore: [
      "**/dist/**",
      "**/node_modules/**",
      "**/build/**",
      "**/storybook-static/**",
    ],
  });

  const ids = Object.keys(local);
  const counter: Record<string, number> = {};

  for (const file of files) {
    const content = fs.readFileSync(file).toString("utf-8");

    for (const id of ids) {
      const regex = new RegExp(`${id}`, "g");
      const match = content.match(regex) || [];
      const prev = counter[id] || 0;
      counter[id] = prev + match.length;
    }
  }

  const unused: string[] = [];

  for (const [id, count] of Object.entries(counter)) {
    if (count === 0) unused.push(id);
  }

  return unused;
}

const inspect = new Command()
  .name("inspect")
  .alias("i")
  .option("-f, --fail", "Throw error if unused ids are found", false)
  .action(async function inspect({ fail }: { fail: boolean }) {
    const ids = await findUnusedIds();
    if (ids.length === 0) return console.log("All ids are in use.".green.bold);

    console.log("Not used".bgRed.bold);

    for (const id of ids) {
      console.log(`   ${id}`.red.bold);
    }

    console.log(`Found ${ids.length} unused id(s)`.red.bold);

    if (fail)
      throw new Error(
        `Found ${ids.length} unused id(s)\nuse "pnpm intl remove" to remove it if needed.`
      );
  });

const remove = new Command()
  .name("remove")
  .alias("rm")
  .action(async function remove() {
    const ids = await findUnusedIds();
    if (ids.length === 0) return console.log("All ids are in use.".gray.bold);
    console.log(`Found ${ids.length} id(s)`.gray.bold);

    const path = "./packages/ui/src/locales/ar-eg.json";
    console.log(`Upadting: ${path}`.italic);

    const content = JSON.parse(fs.readFileSync(path).toString("utf-8"));
    const updated = omit(content, ids);

    fs.writeFileSync(path, JSON.stringify(updated, null, 2));
    console.log("Done.");
  });

new Command()
  .name("intl")
  .description("Analyze and remove unused intl messages")
  .version("1.0.0")
  .addCommand(inspect)
  .addCommand(remove)
  .parse();
