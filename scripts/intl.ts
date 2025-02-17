import fs from "node:fs";
import { glob } from "glob";
import "colors";
import { Command } from "commander";
import { omit } from "lodash";

const localeFiles = {
  shared: "./packages/ui/src/locales/ar-eg.json",
  dashboard: "./apps/dashboard/src/locales/ar-eg.json",
  web: "./apps/web/src/locales/ar-eg.json",
  landing: "./apps/landing/locales/ar-eg.json",
};
type IntlMap = Record<string, { value: string; source: string }>;
type FileMap = Record<string, Array<string>>;

function loadIntlWithSource(): IntlMap {
  const intlMap: IntlMap = {};
  for (const [_, path] of Object.entries(localeFiles)) {
    const content = JSON.parse(fs.readFileSync(path, "utf-8"));
    for (const id in content) {
      intlMap[id] = { value: content[id], source: path };
    }
  }
  return intlMap;
}

async function findUnusedIds(intlMap: IntlMap) {
  const files = await glob("{packages,apps}/**/*.{js,ts,jsx,tsx}", {
    posix: true,
    ignore: [
      "**/dist/**",
      "**/node_modules/**",
      "**/build/**",
      "**/storybook-static/**",
    ],
  });

  const counter = {};
  const ids = Object.keys(intlMap);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");

    for (const id of ids) {
      const regex = new RegExp(`\\b${id}\\b`, "g"); // Match whole word only
      const matches = content.match(regex) || [];
      counter[id] = (counter[id] || 0) + matches.length;
    }
  }

  const unused = ids.filter((id) => counter[id] === 0);
  return unused;
}

async function inspectUnusedIds({ fail }) {
  const intlMap = loadIntlWithSource();
  const unusedIds = await findUnusedIds(intlMap);

  if (unusedIds.length === 0) {
    console.log("All ids are in use.".green.bold);
    return;
  }

  console.log("Not used".bgRed.bold);

  const idsByFile: FileMap = {};
  for (const id of unusedIds) {
    const file = intlMap[id]?.source;
    if (file) {
      if (!idsByFile[file]) idsByFile[file] = [];
      idsByFile[file].push(id);
    }
  }

  for (const [file, ids] of Object.entries(idsByFile)) {
    console.log(`\n${file}`.cyan.bold);
    ids.forEach((id) => console.log(`   ${id}`.red.bold));
  }

  console.log(`\nFound ${unusedIds.length} unused ID(s)`.red.bold);

  if (fail) {
    throw new Error(
      `Found ${unusedIds.length} unused ID(s)\nUse "pnpm intl remove" to remove them if needed.`
    );
  }
}

async function removeUnusedIds() {
  const intlMap = loadIntlWithSource();

  const unusedIds = await findUnusedIds(intlMap);

  if (unusedIds.length === 0) {
    console.log("All ids are in use.".gray.bold);
    return;
  }

  const idsByFile: FileMap = {};
  for (const id of unusedIds) {
    const file = intlMap[id]?.source;
    if (file) {
      if (!idsByFile[file]) idsByFile[file] = [];
      idsByFile[file].push(id);
    }
  }

  for (const [file, ids] of Object.entries(idsByFile)) {
    console.log(`Updating: ${file}`.italic);
    const content = JSON.parse(fs.readFileSync(file, "utf-8"));
    const updated = omit(content, ids);
    fs.writeFileSync(file, JSON.stringify(updated, null, 2));
    console.log(`Removed ${ids.length} ID(s) from ${file}`.green);
    ids.forEach((id) => console.log(`  - ${id}`.red.bold));
  }

  console.log(`\nDone. Removed ${unusedIds.length} unused ID(s) across files.`);
}

const inspect = new Command()
  .name("inspect")
  .alias("i")
  .option("-f, --fail", "Throw error if unused ids are found", false)
  .action(inspectUnusedIds);

const remove = new Command().name("remove").alias("rm").action(removeUnusedIds);

new Command()
  .name("intl")
  .description("Analyze and remove unused intl messages")
  .version("1.0.0")
  .addCommand(inspect)
  .addCommand(remove)
  .parse();
