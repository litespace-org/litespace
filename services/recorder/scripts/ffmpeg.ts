import ffmpeg from "fluent-ffmpeg";

const action = process.argv[2];

function generateTextVideo() {
  const text = process.argv[3] || "Video";
  const file = process.argv[4] || "text.mp4";
  const color = process.argv[5] || "blue";
  const duration = process.argv[6] || 2;
  const audio = Number(process.argv[7] || 1);
  const seconds = Number(duration) * 60;

  return new Promise((resolve, reject) => {
    const output = `assets/${file}`;
    ffmpeg()
      .input(`templates/30-minutes-of-silence.mp3`)
      .input(`assets/${audio}.mp3`)
      .complexFilter([
        `color=color=${color}:size=1280x720:duration=${seconds}[o]`,
        `[o]drawtext=fontsize=120:fontcolor=red:fontfile=FreeSerif.ttf: text='${text}':x=(w-text_w)/2:y=(h-text_h)/2[output]`,
        `[0][1] amix=inputs=2,atrim=0:${seconds}[audio]`,
      ])
      .outputOptions(["-map [output]"])
      .outputOptions(["-map [audio]"])
      .output(output)
      .on("error", reject)
      .on("start", (cmd) => {
        console.log(cmd);
      })
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
      // .input("assets/student-s-1.mp4")
      // .input("assets/student-s-2.mp4")
      // .input("assets/tutor.mp4")
      // .input("assets/first-share-screen.mp4")
      // .input("assets/second-share-screen.mp4")
      .input("assets/tmp-1-0.mp4")
      .input("assets/tmp-1-1.mp4")
      .input("assets/tmp-1-2.mp4")
      .input("assets/tmp-1-3.mp4")
      .input("assets/tmp-1-4.mp4")
      .input("assets/s1.mp4")
      .input("templates/30-minutes-of-silence.mp3")
      .withOption("-threads 5")
      .complexFilter([
        "[0][1][2][3][4] concat=n=5 [output]",
        "[5] adelay=delays=1200000:all=1 [0-a]",
        // "[1:a] adelay=delays=960000:all=1 [1a]",
        // "[2:a] adelay=delays=300000:all=1 [2a]",
        // "[3:a] adelay=delays=0:all=1 [3a]",
        // "[4:a] adelay=delays=0:all=1 [4a]",
        "[0-a][6] amix=inputs=2 [audio]",
        // "[0a][1a][2a][3a][4a][5] amix=inputs=6 [audio]",
        // "color=color=black:size=1280x720:duration=1800[bg]",

        // audio
        // "[0:a]adelay=delays=20000:all=1[0a]",
        // "[2:a][0a]amix=inputs=2[audio]",
      ])
      .outputOptions(["-map [output]"])
      .outputOptions(["-map [audio]"])
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
