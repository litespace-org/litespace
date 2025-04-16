import fs from "node:fs";
import path from "node:path/posix";
import { glob } from "glob";
import { camelCase, upperFirst } from "lodash";
import * as ts from "typescript";

// e.g. assets/arrow-down.svg => arrow-down.svg
function getAssetName(file: string) {
  return path.basename(file);
}

function asEnumKey(file: string) {
  const name = getAssetName(file);
  // remove `.svg` file extension
  if (!name.endsWith(".svg")) throw new Error(`Invalid file name: ${file}`);
  const key = name.replace(".svg", "");
  // e.g., arrow-down => ArrowDown
  return upperFirst(camelCase(key));
}

function asAssetIdEnum(assets: string[]) {
  const values = assets
    .map((asset) => `    ${asEnumKey(asset)} = "${getAssetName(asset)}"`)
    .join(",\n");

  return `enum AssetId {\n${values}\n}`;
}

const paths = {
  types: "dist/index.d.ts",
  cjs: "dist/index.cjs.js",
  esm: "dist/index.esm.mjs",
};

async function main() {
  const location = path.join(path.dirname(__dirname), "assets/");
  const assets = await glob("assets/*.svg");
  const assetId = asAssetIdEnum(assets);
  const source = `export ${assetId}\nexport const location = "${location}"`;

  const cjs = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });

  const esm = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  });

  fs.writeFileSync(
    paths.types,
    [
      `export declare ${assetId};`,
      `export declare const location = "${location}";`,
    ].join("\n")
  );
  fs.writeFileSync(paths.cjs, cjs.outputText);
  fs.writeFileSync(paths.esm, esm.outputText);

  console.log(`Types: ${paths.types}`);
  console.log(`CommonJS: ${paths.cjs}`);
  console.log(`EcmaScript: ${paths.esm}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
