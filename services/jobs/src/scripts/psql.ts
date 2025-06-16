import {
  LITESPACE_DATABASE_S3_BACKUP_PATH,
  PG_FORMAT_FLAG_MAP,
} from "@/constants";
import s3 from "@/lib/s3";
import { Command } from "commander";
import bytes from "bytes";
import axios from "axios";
import path from "node:path/posix";
import fs from "node:fs";
import { BackupMethod } from "@/lib/config";
import { execute } from "@/lib/terminal";

const listCommand = new Command()
  .name("list")
  .description("retreive a list of the available backups")
  .action(async () => {
    const objects = await s3.list(LITESPACE_DATABASE_S3_BACKUP_PATH);
    objects.forEach((object) =>
      console.log(`${object.Key} = ${bytes(object.Size || 0)}`)
    );
  });

const restoreCommand = new Command()
  .name("restore")
  .description("Restore specific backup by using pg_restore")
  .argument(
    "<key>",
    "Specific backup key (which's being listed in the list command)"
  )
  .action(async (key: string) => {
    const url = await s3.get(key);
    const backupFile = await axios({
      url,
      method: "GET",
      // important to be able to write it with fs
      responseType: "arraybuffer",
    });

    const fileName = path.basename(key);
    const filePath = `/tmp/${fileName}`;
    const extension = path.extname(fileName);
    // .slice removes the dot from the file extension (e.g., .dump => dump)
    const backupMethod = extension.slice(1) as BackupMethod;
    const flag = PG_FORMAT_FLAG_MAP[backupMethod];
    const target = `/data/postgres/${fileName}`;

    if (fs.existsSync(filePath)) fs.rmSync(filePath);
    fs.writeFileSync(filePath, backupFile.data);

    await execute(`docker cp ${filePath} postgres:${target}`);
    await execute(
      `docker exec postgres pg_restore --clean \
      -h 127.0.0.1 \
      -U postgres ${flag} \
      -d litespace ${target}`
    );
    await execute(`docker exec postgres rm ${target}`);
  });

new Command()
  .name("psql-backup")
  .description("Manage PSQL backups")
  .version("1.0.0")
  .addCommand(listCommand)
  .addCommand(restoreCommand)
  .parse();
