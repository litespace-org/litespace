import { config } from "@/lib/config";
import { sleep } from "@litespace/utils";
import {
  EgressClient,
  EncodedFileOutput,
  EncodingOptionsPreset,
  S3Upload,
} from "livekit-server-sdk";
import ms from "ms";

async function main() {
  const egressClient = new EgressClient(
    "ws://localhost:7880",
    "devkey",
    "secret"
  );

  const egressInfo = await egressClient.startRoomCompositeEgress(
    "test-room",
    {
      file: new EncodedFileOutput({
        filepath: "test-room.mp4",
        output: {
          case: "s3",
          value: new S3Upload({
            accessKey: config.s3.key,
            secret: config.s3.secret,
            bucket: config.s3.bucket,
            region: "fra1",
            forcePathStyle: true,
            endpoint: "https://fra1.digitaloceanspaces.com",
          }),
        },
      }),
    },
    {
      layout: "grid",
      encodingOptions: EncodingOptionsPreset.H264_1080P_30,
      audioOnly: false,
    }
  );

  await sleep(ms("15s"));

  await egressClient.stopEgress(egressInfo.egressId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
