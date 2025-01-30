import { spaceConfig } from "@/constants";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = "litespace-assets";

const s3 = new S3Client({
  endpoint: "https://fra1.digitaloceanspaces.com",
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "fra1",
  credentials: {
    accessKeyId: spaceConfig.accessKeyId,
    secretAccessKey: spaceConfig.secretAccessKey,
  },
});

async function put({
  key,
  data,
  type,
}: {
  key: string;
  data: Buffer;
  type?: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: type,
    })
  );
}

async function get(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: bucket,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
  return url;
}

export default {
  put,
  get,
};
