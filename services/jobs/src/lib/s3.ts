import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/lib/config";

const s3 = new S3Client({
  endpoint: "https://fra1.digitaloceanspaces.com",
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "fra1",
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
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
      Bucket: config.s3.bucketName,
      Key: key,
      Body: data,
      ContentType: type,
    })
  );
}

async function get(key: string, expiresIn?: number): Promise<string> {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: config.s3.bucketName,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: expiresIn || 60 * 60,
  });
  return url;
}

async function list(prefix: string): Promise<_Object[]> {
  const res = await s3.send(
    new ListObjectsV2Command({
      Prefix: prefix,
      Bucket: config.s3.bucketName,
    })
  );

  return res.Contents || [];
}

async function drop(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
    })
  );
}

export default {
  get,
  put,
  drop,
  list,
};
