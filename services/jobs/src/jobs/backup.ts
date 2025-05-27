import fs from "fs";
import { safePromise } from "@litespace/utils";
import s3 from "@/lib/s3";
import dayjs from "@/lib/dayjs";
import { msg as base } from "@/lib/bot";
import { execute } from "@/lib/terminal";
import { MAX_BACKUPS } from "@/constants";
import axios from "axios";
import { config, dbConfig } from "@/lib/config";
import { exec } from "child_process";

const pgFormatFlag: Record<typeof config.backupMethod, string> = {
  sql: "-Fp",
  tar: "-Ft",
  dump: "-Fc",
};

function msg(text: string) {
  return base("backup", text);
}

async function start() {
  const result = await safePromise(backupPSQL());

  if (result instanceof Error) {
    console.error(result);
    msg(`database backup error: ${result.message}\n\n${result.stack}`);
  }
}

export async function restoreDB(key: string) {
  const rfp = config.rfp;
  const filename = rfp.split("/").pop();

  const url = await s3.get(key);
  const backupFile = await axios({
    url: url,
    method: "GET",
    // important to be able to write it with fs
    responseType: "arraybuffer",
  });

  if (fs.existsSync(rfp)) fs.rmSync(rfp);
  fs.writeFileSync(rfp, backupFile.data);

  // @NOTE: the restore filed is assumed to be in the (docker postgres) data directory
  // see docker.compose file
  exec(
    `docker exec postgres pg_restore \
    -U ${dbConfig.user} \
    ${pgFormatFlag[config.backupMethod]} \
    -d ${dbConfig.database} /data/postgres/${filename}`
  );
}

async function backupPSQL() {
  const now = dayjs().format("YYYY-MM-DD");

  const filename = `${now}.${config.backupMethod}`;
  const filepath = `/tmp/${filename}`;

  if (fs.existsSync(filepath)) fs.rmSync(filepath);
  await execute(
    `docker exec postgres pg_dump \
    -U ${dbConfig.user} \
    ${pgFormatFlag[config.backupMethod]} \
    -d ${dbConfig.database} >> ${filepath}`
  );

  // @TODO: file size can be compressed further by gzip

  const oldBackups = await s3.getBackupList("psql");
  while (oldBackups.length > MAX_BACKUPS - 1) {
    // @NOTE: getBackupList retreives in asc order
    const oldest = oldBackups.shift() || "";
    await s3.drop(oldest);
  }
  await uploadWithS3(filepath, "backups/psql/" + filename);

  fs.rmSync(filepath);
}

async function uploadWithS3(path: string, name: string) {
  const file = fs.readFileSync(path);
  const buffer: Buffer = Buffer.from(file);
  await s3.put({
    key: name,
    data: buffer,
  });
}

export default { start };
