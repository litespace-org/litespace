import fs from "node:fs";
import { glob } from "glob";
import path from "node:path";
import { exec } from "node:child_process";

async function execute(command: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stdout);
      return resolve(stdout);
    });
  });
}

async function open(url: string) {
  const start =
    process.platform == "darwin"
      ? "open"
      : process.platform == "win32"
        ? "start"
        : "xdg-open";

  return await execute(`${start} ${url}`);
}

function withBody(body: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiteSpace SVGs</title>

    <style>
      .container {
        max-width: 1024px;
        margin: auto;
        padding: 24px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }

      .svg-item {
        display: flex;
        align-items: start;
        gap: 12px;
      }

      .svg-container {
        grid-column: span 1 / span 1;
        min-width: 120px;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e2e2e2;
        border-radius: 8px;
        background-color: #f3f4f6;
        padding: 4px;
      }
    </style>
  </head>
  <body style="font-family: monospace;" class="container">
    ${body}
  </body>
</html>
 `;
}

function renderSvg({
  name,
  absolutePath,
  svgContent,
}: {
  name: string;
  absolutePath: string;
  svgContent: string;
}): string {
  return `
    <div class="svg-item">
      <a href="${absolutePath}" target="_blank">
        <div class="svg-container">
          ${svgContent} 
        </div>
      </a>
      <p>${name}</p>
    </div>
  `;
}

async function main() {
  const assets = await glob("assets/*.svg", { posix: true });

  const svgContent: string[] = assets.map((asset) => {
    const content = fs.readFileSync(asset).toString("utf-8");
    const absolutePath = path.join(__dirname, "..", asset);
    return renderSvg({
      name: asset,
      absolutePath,
      svgContent: content,
    });
  });

  const htmlContent = withBody(svgContent.join("\n"));
  fs.writeFileSync("svgs.html", htmlContent);
  await open(path.join("svgs.html"));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
