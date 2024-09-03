import ffmpeg from "fluent-ffmpeg";

export async function joinVideos({
  first,
  second,
  output,
}: {
  first: string;
  second: string;
  output: string;
}) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(first)
      .input(second)
      .addOption("-threads 1")
      .complexFilter([
        "[0:a][1:a]amix=inputs=2:duration=longest[amixed]",
        "[0]scale=640:720[0scaled]",
        "[1]scale=640:720[1scaled]",
        "[0scaled]pad=1280:720[0padded]",
        "[0padded][1scaled]overlay=shortest=1:x=640[output]", // todo: overlay the longest!
      ])
      .outputOptions(["-map [amixed]"])
      .outputOptions(["-map [output]"])
      .output(output)
      .on("error", reject)
      .on("progress", function (progress) {
        if (!progress.percent) return;
        console.log(
          `Processing ${first} and ${second} ${progress.percent.toFixed(2)} %`
            .gray
        );
      })
      .on("end", function () {
        resolve(output);
      })
      .run();
  });
}
