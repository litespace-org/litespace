import ffmpeg from "fluent-ffmpeg";

const action = process.argv[2];

function generateTextVideo() {
  const text = process.argv[3] || "Video";
  const file = process.argv[4] || "text.mp4";
  const color = process.argv[5] || "blue";
  const duration = process.argv[6] || 2;
  const seconds = Number(duration) * 60;

  return new Promise((resolve, reject) => {
    const output = `assets/${file}`;
    ffmpeg()
      .input("assets/1m.mp3")
      .complexFilter([
        `color=color=${color}:size=1280x720:duration=${seconds}[o]`,
        `[o]drawtext=fontsize=120:fontcolor=red:fontfile=FreeSerif.ttf: text='${text}':x=(w-text_w)/2:y=(h-text_h)/2[output]`,
      ])
      .outputOptions(["-map [output]"])
      .output(output)
      .on("error", reject)
      .on("progress", function (progress) {
        if (!progress.percent) return;
        console.log(`Processing ${progress.percent.toFixed(2)} %`);
      })
      .on("end", function () {
        resolve(output);
      })
      .run();
  });
}

async function main() {
  if (action === "text") return await generateTextVideo();

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("assets/v1.mp4")
      .input("assets/v2.mp4")
      .withOption("-threads 5")
      .complexFilter([
        "color=color=black:size=1280x720:duration=900[bg]",
        "[1] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-1]",
        "[trim-1] setpts=PTS+300/TB, scale=1279x719:force_original_aspect_ratio=decrease, pad=1280:720:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-1]",
        "[bg][scale-1] overlay=eof_action=pass [overlay-1]",
        "[0] trim=start=300:end=600, setpts=PTS-STARTPTS [trim-0]",
        "[trim-0] setpts=PTS+300/TB, scale=255x143:force_original_aspect_ratio=decrease, pad=256:144:(ow-iw)/2:(oh-ih)/2, setsar=1 [scale-0]",
        "[overlay-1][scale-0] overlay=eof_action=pass:x=1015:y=567 [output]",
      ])
      .outputOptions(["-map [output]"])
      .output("assets/script-output.mp4")
      .on("error", reject)
      .on("progress", function (progress) {
        if (!progress.percent) return;
        console.log(`Processing ${progress.percent.toFixed(2)} %`);
      })
      .on("end", function () {
        resolve("script-output.mp4");
      })
      .run();
  });
}

main()
  .then((output) => {
    console.log("Output: ", output);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
