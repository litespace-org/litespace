import lesson from "@/jobs/lesson";
import backup from "@/jobs/backup";
import { Command } from "commander";
import { composeSerialAsync } from "@litespace/utils";
import { exit } from "@/lib/process";

const lessonCommand = new Command("lesson").action(
  composeSerialAsync(lesson.start, exit)
);

const backupCommand = new Command("backup").action(
  composeSerialAsync(backup.start, exit)
);

new Command()
  .name("runner")
  .version("1.0.0")
  .description("Direct cron jobs runner")
  .addCommand(lessonCommand)
  .addCommand(backupCommand)
  .parse();
