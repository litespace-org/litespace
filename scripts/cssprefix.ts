// ref: https://github.com/tailwindlabs/tailwindcss/discussions/2598#discussioncomment-4813766
// const glob = require("glob");

import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { last } from "lodash";

const rootDir = "ui/";
const classNameRegex = /className=["']([\w\s[\]!:-]+)["']/g;
// ref: https://regex101.com/r/5u2FAD/1
const classnamesRegex = /cn\((\s*["']([\w\s[\]!:&_=-]+)["'],?\s*)*\)/g;
const files = globSync(["src/{components,internal}/**/*.tsx"], {
  cwd: rootDir,
});
const prefix = "tw-";

function asPrefixed(name: string): string {
  if (
    name.startsWith(prefix) ||
    name.startsWith(`-${prefix}`) ||
    name.startsWith(`!${prefix}`) ||
    name.startsWith(`!-${prefix}`)
  )
    return name;

  if (name.startsWith("!-")) {
    // remove "!-" at the beginning
    const modified = name.slice(2);
    return `!-${prefix}${modified}`;
  }

  if (name.startsWith("!")) {
    // remove "!" at the beginning
    const modified = name.slice(1);
    return `!${prefix}${modified}`;
  }

  if (name.startsWith("-")) {
    // remove "-" at the beginning
    const modified = name.slice(1);
    return `-${prefix}${modified}`;
  }

  return `${prefix}${name}`;
}

function wrap(value: string): string {
  return `"${value}"`;
}

function wrapCn(value: string): string {
  return `cn(${value})`;
}

function wrapClassname(value: string): string {
  return `className="${value}"`;
}

function prefixCssClassnames(names: string): string {
  return names
    .split(" ")
    .map((name) => {
      if (name.includes(":")) {
        const parts = name.split(":");
        const style = last(parts);
        if (!style) throw new Error("unexpected error");
        const prefixed = asPrefixed(style);
        return [...parts.slice(0, parts.length - 1), ":", prefixed].join("");
      }
      return asPrefixed(name);
    })
    .join(" ");
}

function processClassnames(match: string) {
  // remove "cn(" and ")"
  const raw = match.slice(3, -1);
  const lines = raw
    .split(",")
    .map(
      (line) => line.trim().slice(1, -1) // remove quotes from the start and the end.
    )
    .map((line) => wrap(prefixCssClassnames(line)))
    .join(",\n");
  return wrapCn(lines);
}

function processClassName(match: string) {
  return wrapClassname(prefixCssClassnames(match));
}

files.forEach((file) => {
  const filePath = path.join(rootDir, file);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const result = data
      .replace(classNameRegex, (_, p) => {
        return processClassName(p);
      })
      .replace(classnamesRegex, (match) => {
        return processClassnames(match);
      });

    fs.writeFile(filePath, result, "utf-8", (err) => {
      if (err) console.error(err);
    });
  });
});
