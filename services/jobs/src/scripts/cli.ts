import lesson from "@/jobs/lesson";
import keepAlive from "@/jobs/keepAlive";
import backup from "@/jobs/backup";
import { Command } from "commander";
import { composeSerialAsync } from "@litespace/utils";
import { exit } from "@/lib/process";
import interview from "@/jobs/interview";

const lessonCommand = new Command("lesson").action(
  composeSerialAsync(lesson.start, exit)
);

const keepAliveCommand = new Command("keep-alive").action(
  composeSerialAsync(keepAlive.start, exit)
);

const backupCommand = new Command("backup").action(
  composeSerialAsync(backup.start, exit)
);

const immediateInterviewsCommand = new Command("immediate-interviews")
  .description(
    "command for starting interview reminders before they start for both tutors and tutor managers"
  )
  .action(composeSerialAsync(interview.startImmediateReminder, exit));

const mornignInterviewsCommand = new Command("morning-interviews")
  .description("command for starting morning interview reminders for tutors")
  .action(composeSerialAsync(interview.startMorningReminder, exit));

new Command()
  .name("runner")
  .version("1.0.0")
  .description("Command line interface for interacting with the jobs service")
  .addCommand(lessonCommand)
  .addCommand(keepAliveCommand)
  .addCommand(backupCommand)
  .addCommand(immediateInterviewsCommand)
  .addCommand(mornignInterviewsCommand)
  .parse();
