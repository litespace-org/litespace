import fs from "fs";
import { safePromise } from "@litespace/utils";
import s3 from "@/lib/s3";
import dayjs from "@/lib/dayjs";
import { msg as base } from "@/lib/bot";
import { execute } from "@/lib/terminal";
import {
  LITESPACE_DATABASE_S3_BACKUP_PATH,
  PG_FORMAT_FLAG_MAP,
  MAX_BACKUPS,
} from "@/constants";
import { config } from "@/lib/config";
import { first, orderBy } from "lodash";
import path from "node:path";

function msg(text: string) {
  return base("backup", text);
}

async function start(): Promise<boolean> {
  const result = await safePromise(backup());

  if (result instanceof Error) {
    console.error(result);
    msg(`database backup error: ${result.message}\n\n${result.stack}`);
    return false;
  }

  return true;
}

async function backup() {
  const now = dayjs().format("YYYY-MM-DD");

  const filename = `${now}.${config.backupMethod}`;
  const filepath = `/tmp/${filename}`;
  if (fs.existsSync(filepath)) fs.rmSync(filepath);

  // @todo: file size can be compressed further by gzip
  const flag = PG_FORMAT_FLAG_MAP[config.backupMethod];
  await execute(
    `docker exec postgres pg_dump \
    -U postgres ${flag} -h 127.0.0.1 \
    -d litespace >> ${filepath}`
  );

  await removeOutdatedBackups();

  // upload file to s3
  await upload(
    filepath,
    path.join(LITESPACE_DATABASE_S3_BACKUP_PATH, filename)
  );

  // remove artifacts
  fs.rmSync(filepath);
}

async function removeOutdatedBackups() {
  const list = await s3.list(LITESPACE_DATABASE_S3_BACKUP_PATH);
  const keys = list
    .filter((object) => typeof object.Key === "string")
    .map((object) => object.Key) as string[];

  const ordered = orderBy(
    keys,
    (key) => {
      const fileName = path.basename(key);
      const date = first(fileName.split("."));
      if (!date) throw new Error(`invalid file name: ${fileName}`);
      return dayjs.utc(date).unix();
    },
    "asc"
  );

  while (ordered.length > MAX_BACKUPS - 1) {
    const oldest = ordered.shift();
    if (!oldest) break;
    await s3.drop(oldest);
  }
}

async function upload(path: string, name: string) {
  const file = fs.readFileSync(path);
  await s3.put({ key: name, data: Buffer.from(file) });
}

export default { start };
