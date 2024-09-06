import ffmpeg from "fluent-ffmpeg";

async function main() {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input("assets/s1.mp4")
      .input("assets/s2.mp4")
      .input("assets/1m.mp3")
      .complexFilter([
        "color=color=black:size=1280x720:duration=120[over]",
        "[0:v]setpts=PTS+20/TB, scale=720:720[vid0]",
        // "[vid0]setpts=PTS+20/TB[a]",
        "[over][vid0]overlay=eof_action=pass[output]",
        // audio
        "[0:a]adelay=delays=20000:all=1[0a]",
        "[2:a][0a]amix=inputs=2[audio]",
      ])
      .outputOptions(["-map [output]"])
      .outputOptions(["-map [audio]"])
      .output("assets/so.mp4")
      .on("error", reject)
      .on("progress", function (progress) {
        if (!progress.percent) return;
        console.log(`Processing ${progress.percent.toFixed(2)} %`);
      })
      .on("end", function () {
        resolve("so.mp4");
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
