import schedule from "node-schedule";
import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";

async function main() {
  // setup cron jobs
  schedule.scheduleJob("*/15 * * * *", lesson.start);
  schedule.scheduleJob("*/15 * * * *", keepAlive.start);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
