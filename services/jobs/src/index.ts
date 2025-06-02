import schedule from "node-schedule";
import { sendLessonReminders } from "@/jobs/lesson";
import { backupDB } from "@/jobs/db";

async function main() {
  // Run jobs immediately on startup
  await sendLessonReminders();
  await backupDB();

  // Send lesson reminders every 10 minutes
  schedule.scheduleJob("*/15 * * * *", sendLessonReminders);

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
