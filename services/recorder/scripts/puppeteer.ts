import { launch, getStream, wss } from "puppeteer-stream";
import fs from "node:fs";
import path from "node:path";
import internal from "node:stream";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const url = "https://files.vidstack.io/sprite-fight/720p.mp4";

async function main() {
  const browser = await launch({
    // or on linux: "google-chrome-stable"
    // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    executablePath: "google-chrome-stable",
    headless: "new",
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const streams: internal.Transform[] = [];
  const files: fs.WriteStream[] = [];

  for (let i = 1; i <= 100; i++) {
    console.log("recording: ", i);
    const page = await browser.newPage();
    await page.goto(url);
    const file = fs.createWriteStream(path.join(__dirname, `videos/${i}.webm`));
    const stream = await getStream(page, { audio: true, video: true }).then(
      (stream) => {
        stream.pipe(file);
        return stream;
      }
    );

    streams.push(stream);
    files.push(file);
  }

  await sleep(15 * 60 * 1000); // 15 minutes
  streams.forEach((stream) => stream.destroy());
  files.forEach((file) => file.close());
  await browser.close();
  await wss.then((socket) => socket.close());
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
