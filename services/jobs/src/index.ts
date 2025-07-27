import schedule from "node-schedule";
import lesson from "@/jobs/lesson";
import backup from "@/jobs/backup";

async function main() {
  schedule.scheduleJob("*/15 * * * *", lesson.start);
  schedule.scheduleJob("0 0 * * *", backup.start);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
