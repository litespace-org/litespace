import { spaceConfig } from "@/constants";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
      Bucket: spaceConfig.bucketName,
      Key: key,
      Body: data,
      ContentType: type,
    })
  );
}

async function get(key: string, expiresIn?: number): Promise<string> {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: spaceConfig.bucketName,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: expiresIn || 60 * 60,
  });
  return url;
}

async function list(path: string): Promise<string[]> {
  const output = await s3.send(
    new ListObjectsV2Command({
      Bucket: spaceConfig.bucketName,
      Prefix: path,
    })
  );

  const keys: string[] = [];
  const objects = output.Contents || [];
  for (const object of objects) {
    if (object.Key) keys.push(object.Key);
  }
  return keys;
}

async function drop(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: spaceConfig.bucketName,
      Key: key,
    })
  );
}

export default {
  put,
  get,
  drop,
  list,
};
