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
      .input("assets/student-s-1.mp4")
      .input("assets/student-s-2.mp4")
      .input("assets/tutor.mp4")
      .input("assets/first-share-screen.mp4")
      .input("assets/second-share-screen.mp4")
      .withOption("-threads 5")
      .complexFilter([
        "color=color=black:size=1280x720:duration=1800[bg]",

        // audio
        // "[0:a]adelay=delays=20000:all=1[0a]",
        // "[2:a][0a]amix=inputs=2[audio]",
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
