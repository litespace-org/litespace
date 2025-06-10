import { restoreDB } from "@/jobs/db";
import s3 from "@/lib/s3";
import { safe } from "@litespace/utils";
import { Command } from "commander";

const list = new Command()
  .name("list")
  .description("retreive a list of the available backups")
  .action(async () => {
    const list = await safe(() => s3.getBackupList("psql"));
    if (list instanceof Error) throw list;
    console.log(list);
  });

const restore = new Command()
  .name("restore")
  .description("Restore specific backup by using pg_restore")
  .argument(
    "<key>",
    "Specific backup key (which's being listed in the list command)"
  )
  .action(async (key: string) => {
    await restoreDB(key);
  });

new Command()
  .name("backups-psql")
  .description("Manage PSQL backups.")
  .version("1.0.0")
  .addCommand(list)
  .addCommand(restore)
  .parse();
