import fs from "node:fs";
import path from "node:path/posix";
import { glob } from "glob";
import { camelCase, upperFirst } from "lodash";

type Exports = Record<string, string>;
type PackageJson = {
  exports: Exports;
};

function asComponentName(file: string) {
  // e.g. assets/arrow-down.svg => arrow-down.svg
  const name = path.basename(file);
  // remove `.svg` file extension
  if (!name.endsWith(".svg")) throw new Error(`Invalid file name: ${file}`);
  const key = name.replace(".svg", "");
  // e.g., arrow-down => ArrowDown
  return upperFirst(camelCase(key));
}

function asExportKey(file: string) {
  const component = asComponentName(file);
  return `./${component}`;
}

function asComponentPath(file: string) {
  const component = asComponentName(file);
  return `./dist/${component}.tsx`;
}

async function getExports(): Promise<Exports> {
  const files = await glob("assets/*.svg", {
    posix: true,
  });
  const sorted = [...files].sort();
  const exports: Exports = {};

  for (const file of sorted) {
    exports[asExportKey(file)] = asComponentPath(file);
  }

  return exports;
}

function loadPackageJson(): PackageJson {
  const json = fs.readFileSync("package.json").toString();
  return JSON.parse(json);
}

function savePackageJson(pkg: PackageJson): void {
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
}

async function main() {
  const exports = await getExports();
  const pkg = loadPackageJson();
  const updated = {
    ...pkg,
    exports: {
      ".": pkg.exports["."],
      ...exports,
    },
  };
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
