import schedule from "node-schedule";
import { sendLessonReminders } from "@/jobs/lesson";

async function main() {
  // Run the job immediately on startup
  await sendLessonReminders();
  // Schedule the job to run every 15 minutes
  schedule.scheduleJob("*/15 * * * *", sendLessonReminders);

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
