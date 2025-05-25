import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { spaceConfig } from "@/lib/config";

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

async function getBackupList(of: "psql"): Promise<Array<string>> {
  const res = await s3.send(
    new ListObjectsV2Command({
      Prefix: `backups/${of}/`,
      Bucket: spaceConfig.bucketName,
    })
  );
  return res.Contents?.map((c) => c.Key || "") || [];
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
  getBackupList,
  get,
  put,
  drop,
};
