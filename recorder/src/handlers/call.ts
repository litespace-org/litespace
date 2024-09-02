import { serverConfig } from "@/config";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import fs from "node:fs";
import path from "node:path";
import zod from "zod";
import "colors";
import ffmpeg from "fluent-ffmpeg";

const body = zod.object({
  call: zod.coerce.number(),
  user: zod.coerce.number(),
});
// "[0:v]scale=640:720[0scaled]",
// "[1:v]scale=640:720[1scaled]",
// "[0scaled]pad=1280:720[0padded]",
// "[0padded][1scaled]overlay=shortest=1:x=640[output]",

// ffmpeg()
//   .input("assets/1-1.mp4")
//   .input("assets/sample.mp4")
//   .addOption("-threads 1")
//   .complexFilter([
//     "[0:a][1:a]amix=inputs=2:duration=longest[amixed]",
//     "[0]scale=640:720[0scaled]",
//     "[1]scale=640:720[1scaled]",
//     "[0scaled]pad=1280:720[0padded]",
//     "[0padded][1scaled]overlay=shortest=1:x=640[output]", // todo: overlay the longest!
//   ])
//   .outputOptions(["-map [amixed]"])
//   .outputOptions(["-map [output]"])
//   .output("assets/output2.mp4")
//   .on("error", function (er) {
//     console.log("error occured: " + er.message);
//   })
//   .on("start", (cmd) => {
//     console.log(cmd);
//   })
//   .on("codecData", function (data) {
//     console.log(
//       "Input is " + data.audio + " audio " + "with " + data.video + " video"
//     );
//   })
//   .on("progress", function (progress) {
//     console.log("Processing: " + progress.percent + "% done");
//   })
//   .on("end", function () {
//     console.log("success");
//   })
//   .run();

export async function uploadChunk(req: Request, res: Response) {
  const chunk = req.file;
  if (!chunk) throw new Error("Missing call file chunk");
  const { call, user } = body.parse(req.body);

  const filename = `${call}-${user}.mp4`;
  if (!chunk) throw new Error("Missing uploadded file; should never happen");

  console.log(`Processing: ${filename} size: ${chunk.size}`.cyan);
  const location = path.join(serverConfig.assets, filename);
  if (!fs.existsSync(serverConfig.assets)) fs.mkdirSync(serverConfig.assets);
  fs.appendFileSync(location, chunk.buffer);
  res.status(200).send();
}

export default {
  uploadChunk: asyncHandler(uploadChunk),
};
