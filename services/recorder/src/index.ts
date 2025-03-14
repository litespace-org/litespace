import schedule from "node-schedule";
import dayjs from "@/lib/dayjs";
import playwrite, { Browser, BrowserContext } from "playwright";
import { getSessions } from "@/lib/session";
import { router } from "@/lib/router";
import { Web } from "@litespace/utils/routes";
import ms from "ms";
import { msg } from "@/lib/telegram";
import { countBy } from "lodash";
import { ISession } from "@litespace/types";

type JobContext = {
  browser: Browser;
  context: BrowserContext;
};

/**
 * The max number of jobs at any point of time is 11 (10 browser pages + the
 * main job).
 *
 * This will prevent the browser from consuming a lot of memory.
 */
const MAX_JOB_COUNT = 11;

const INTERVIEW_DURATION = 30;

function jobs({ context }: JobContext) {
  return async () => {
    await msg("Identifying sessions for recording");

    const start = dayjs.utc();
    const end = start.add(10, "minutes");
    const sessions = await getSessions({
      after: start.toISOString(),
      before: end.toISOString(),
    });

    const empty = sessions.length === 0;
    const count = countBy(sessions, (session) => session.type) as Partial<
      Record<ISession.Type, number>
    >;
    const lessonCount = count.lesson || 0;
    const interviewCount = count.interview || 0;
    await msg(
      empty
        ? "Found no sessions"
        : `Found ${sessions.length} session(s) (${lessonCount} lesson(s) / ${interviewCount} interview(s))`
    );

    for (const session of sessions) {
      const id =
        session.type === "lesson"
          ? session.id.toString()
          : session.ids.self.toString();
      const sessionId =
        session.type === "lesson" ? session.sessionId : session.ids.session;
      const duration =
        session.type == "lesson" ? session.duration : INTERVIEW_DURATION;

      const jobs = schedule.scheduledJobs;
      if (Object.keys(jobs).length > MAX_JOB_COUNT) {
        await msg(
          "Eliminating some sessions from being recored due to reaching the max job count"
        );
        break;
      }

      schedule.scheduleJob(
        sessionId,
        dayjs.utc(session.start).toDate(),
        async () => {
          const page = await context.newPage();
          await page.goto(
            router.web({
              route: Web.Session,
              // todo: add the auth token for the ghost
              query: { id, type: session.type },
              full: true,
            })
          );

          /**
           * The page will be closed once an html `div` with the id
           * `end-session` is attached to the DOM (not necessary visible).
           *
           * Idealy the end-sesion div should be rendered after the recording
           * is uploaded to the media server.
           *
           * As a fallback mechanism, if the session didn't render the
           * end-session div, the page will be closed automatically after a
           * timeout.
           *
           * The timeout is defined as "session duration + 5 minutes". The 5
           * mintues should be more than enough to upload the session recording
           * to the media server.
           */
          await page.waitForSelector("div#end-session", {
            state: "attached",
            // Add 5 mintues to the existing session duration as a buffer time.
            timeout: ms(`${duration + 5}m`),
          });

          await page.close();
        }
      );
    }

    const jobCount = Object.keys(schedule.scheduledJobs).length;
    await msg(`Done. Current job count is ${jobCount}`);
  };
}

async function main() {
  const browser = await playwrite.chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Run the cron job every 10 minutes
  schedule.scheduleJob("main", "*/10 * * * *", jobs({ browser, context }));

  process.on("SIGINT", async function () {
    await schedule.gracefulShutdown();
    await context.close();
    await browser.close();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
