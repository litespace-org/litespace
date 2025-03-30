import path from "path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { Command } from "commander";
import ms from "ms";
import dayjs from "@/lib/dayjs";
import { Props as StreamProps } from "@/composition/Stream";
import {
  Props as SessionProps,
  schema as sessionSchema,
} from "@/composition/Session";
import { faker, imageUrl } from "@/lib/faker";
import { SingleBar } from "cli-progress";
import fs from "node:fs";
import { Video } from "@/lib/compose";

const start = dayjs().utc().startOf("hour");
const users = {
  1: {
    name: faker.person.fullName(),
    image: imageUrl(),
  },
  2: {
    name: faker.person.fullName(),
    image: imageUrl(),
  },
};

const templates = {
  complex: {
    /**
     * Timeline:
     *
     * u1: =====_=================_======
     *
     * u2: _===============_=============
     *
     * s1: __________________==========__
     */
    timeline: [
      // u1 - joined for the first 5 minutes.
      {
        userId: 1,
        start,
        duration: 5,
      },
      // u1 - then left for one minute (e.g., network issue) and then joined for another 17 minutes.
      {
        userId: 1,
        start: start.add(6, "minutes"),
        duration: 17,
      },
      // u1 - then left for one minute and joined again for the last 6 minutes.
      {
        userId: 1,
        start: start.add(24, "minutes"),
        duration: 6,
      },
      // u2 - joined a 1 minute late and stayed for 15 minutes
      {
        userId: 2,
        start: start.add(1, "minute"),
        duration: 15,
      },
      // u2 - then left the session for 1 minute and joined again till the end of the session (13 minutes)
      {
        userId: 2,
        start: start.add(17, "minute"),
        duration: 13,
      },
      // s1 - a screen was shared by `u1` for 10 minutes
      {
        userId: 1,
        start: start.add(18, "minute"),
        duration: 10,
        screen: true,
      },
    ],
  },
} as const;

type TemplateId = keyof typeof templates;

const session = new Command()
  .name("session")
  .option("-t, --template <name>", "Session template", Object.keys(templates))
  .option(
    "-s, --save",
    "Save session artifacts to be used in remotion studio",
    true
  )
  .action(async (options: { template: TemplateId; save: boolean }) => {
    const template = templates[options.template];

    const compositionId = "stream";
    const videos: Video[] = [];

    for (const item of template.timeline) {
      const user = users[item.userId];
      const screen = "screen" in item && item.screen;

      const inputProps: StreamProps = {
        id: item.userId,
        duration: item.duration,
        start: item.start.toISOString(),
        image: screen
          ? faker.image.urlPicsumPhotos({ width: 1920, height: 1080 })
          : user.image,
        name: user.name,
        screen: screen,
      };

      const composition = await selectComposition({
        serveUrl: path.resolve("./build"),
        id: compositionId,
        inputProps,
      });

      const fileName = `${item.start.valueOf()}-${item.userId}.mp4`;
      const filePath = `out/${fileName}`;
      const bar = new SingleBar({
        fps: 5,
        format:
          "Progress [{bar}] | {renderEstimatedTime} | {percentage}% | {fileName}",
      });

      bar.start(1, 0, {
        renderEstimatedTime: "N/A",
        percentage: "N/A",
        fileName,
      });

      await renderMedia({
        composition,
        serveUrl: path.resolve("./build"),
        codec: "h264",
        outputLocation: filePath,
        inputProps,
        onProgress(data) {
          bar.update(data.progress, {
            renderEstimatedTime: data.renderEstimatedTime
              ? ms(data.renderEstimatedTime)
              : "0",
            percentage: data.progress.toFixed(2).toString(),
          });
        },
      });

      bar.stop();

      videos.push({
        id: faker.number.int(),
        userId: item.userId,
        start: item.start,
        duration: item.duration * 60 * 1000, // minutes => millseconds
        src: fileName,
        screen,
      });
    }

    if (options.save) {
      fs.writeFileSync(
        "session.json",
        JSON.stringify(
          {
            videos: videos.map((video) => ({
              ...video,
              start: video.start.toISOString(),
            })),
          },
          null,
          2
        )
      );
      console.log("Saved videos artifacts to session.json");
    }
  });

const compose = new Command()
  .name("compose")
  .option("-c, --composition <id>", "Composition id", ["session"])
  .action(async (options: { composition: "session" }) => {
    const compositionId = options.composition;

    const inputProps: SessionProps = sessionSchema.parse(
      JSON.parse(fs.readFileSync("session.json").toString("utf-8"))
    );

    const fileName = `session.mp4`;
    const filePath = `out/${fileName}`;
    const build = path.resolve("./build");

    const composition = await selectComposition({
      serveUrl: build,
      id: compositionId,
      inputProps,
    });

    const bar = new SingleBar({
      fps: 5,
      format:
        "Progress [{bar}] | {renderEstimatedTime} | {percentage}% | {fileName}",
    });

    bar.start(1, 0, {
      renderEstimatedTime: "N/A",
      percentage: "N/A",
      fileName,
    });

    await renderMedia({
      composition,
      serveUrl: build,
      codec: "h264",
      outputLocation: filePath,
      inputProps,
      onProgress(data) {
        bar.update(data.progress, {
          renderEstimatedTime: data.renderEstimatedTime
            ? ms(data.renderEstimatedTime)
            : "0",
          percentage: data.progress.toFixed(2).toString(),
        });
      },
      concurrency: 2,
      chromiumOptions: {},
    });

    bar.stop();
  });

new Command()
  .name("render")
  .description("Render compositions")
  .version("1.0.0")
  .addCommand(session)
  .addCommand(compose)
  .parse();
