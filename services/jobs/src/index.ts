import { Producer } from "@litespace/kafka";
import express from "express";
import { PORT } from "@/constants";
import schedule from "node-schedule";
import { sendLessonReminders } from "@/tasks/lesson";

const producer = new Producer();
producer.connect();

const app = express();

async function main() {
  // Run the job immediately on startup
  await sendLessonReminders(producer);

  // Schedule the job to run every 15 minutes
  schedule.scheduleJob(
    "*/15 * * * *",
    async () => await sendLessonReminders(producer)
  );

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

main();
