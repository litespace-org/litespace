import schedule from "node-schedule";
import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";
import { backupDB } from "@/jobs/db";

async function main() {
  // Run jobs immediately on startup
  await backupDB();

  // setup cron jobs
  schedule.scheduleJob("*/15 * * * *", lesson.start);
  schedule.scheduleJob("*/15 * * * *", keepAlive.start);

  // Backup the database every friday 00:00 (12:00 AM) o'clock
  schedule.scheduleJob({ hour: 0, minute: 0, dayOfWeek: 5 }, backupDB);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
