import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";
import backup from "@/jobs/backup";
import { Command } from "commander";

new Command()
  .name("runner")
  .version("1.0.0")
  .description("Direct cron jobs runner")
  .addCommand(new Command("lesson").action(lesson.start))
  .addCommand(new Command("keep-alive").action(keepAlive.start))
  .addCommand(new Command("backup").action(backup.start))
  .parse();
