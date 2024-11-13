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

async function getExports(): Promise<Exports> {
  const files = await glob("assets/*.svg", {
    posix: true,
  });
  const sorted = [...files].sort();
  const exports: Exports = {};

  for (const file of sorted) {
    exports[withCurrentDir(path.basename(file))] = withCurrentDir(file);
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
