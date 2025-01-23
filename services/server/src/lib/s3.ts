import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = "litespace-assets-staging";

const s3 = new S3Client({
  region: "me-south-1",
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
