import fs from "node:fs";
import path from "node:path/posix";
import { glob } from "glob";

type Exports = Record<string, string>;
type PackageJson = {
  exports: Exports;
};

function withCurrentDir(file: string): string {
  return `./${file}`;
}

function asExportKey(file: string) {
  // e.g. dist/ArrowDown.tsx => ArrowDown.tsx
  const name = path.basename(file);
  // remove `.tsx` file extension
  if (!name.endsWith(".tsx")) throw new Error(`Invalid file name: ${file}`);
  const key = name.replace(".tsx", "");
  // prefix it with `./` (current dir) => ./ArrowDown
  return withCurrentDir(key);
}

async function getExports(): Promise<Exports> {
  const files = await glob("dist/*.tsx", {
    posix: true,
  });
  const sorted = [...files].sort();
  const exports: Exports = {};

  for (const file of sorted) {
    exports[asExportKey(file)] = withCurrentDir(file);
  }
  return exports;
}

function loadPackageJson(): PackageJson {
  const json = fs.readFileSync("package.json").toString();
  return JSON.parse(json);
}

function savePackageJson(pkg: PackageJson): void {
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
}

async function main() {
  const exports = await getExports();
  const pkg = loadPackageJson();
  const updated = { ...pkg, exports };
  savePackageJson(updated);
  console.log("Done.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
