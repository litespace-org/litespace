import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "me-south-1",
  profile: "ahmed",
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
      Bucket: "litespace-assets-staging",
      Key: key,
      Body: data,
      ContentType: type,
    })
  );
}

async function get(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: "litespace-assets-staging",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 });
  return url;
}

export default {
  put,
  get,
};
