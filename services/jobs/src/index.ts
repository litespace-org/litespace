import schedule from "node-schedule";
import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";
import backup from "@/jobs/backup";
import interview from "@/jobs/interview";

async function main() {
  schedule.scheduleJob("*/15 * * * *", lesson.start);
  schedule.scheduleJob("*/15 * * * *", keepAlive.start);
  schedule.scheduleJob("0 0 * * *", backup.start);
  schedule.scheduleJob("*/15 * * * *", interview.startImmediateReminder);
  schedule.scheduleJob("0 8 * * *", interview.startMorningReminder);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
