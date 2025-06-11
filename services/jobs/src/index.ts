import schedule from "node-schedule";
import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";

async function main() {
  // run jobs immediately on startup
  await lesson.start();

  // setup cron jobs
  schedule.scheduleJob("*/15 * * * *", lesson.start);
  schedule.scheduleJob("*/5 * * * *", keepAlive.start);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
