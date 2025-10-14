import { mattermost } from "@/lib/mattermost";
import { availabilitySlots, lessons } from "@litespace/models";
import dayjs from "@/lib/dayjs";
import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
  sumSlotsDuration,
} from "@litespace/utils";
import humanizeDuration from "humanize-duration";
import { ILesson } from "@litespace/types";
import { sumBy } from "lodash";
import { config } from "@/lib/config";

async function start() {
  const now = dayjs.utc();

  const [slotsOfToday, slotsOfTomorrow, slotsOfNextWeek] = await Promise.all([
    availabilitySlots.find({
      start: { gte: now.startOf("day").toISOString() },
      end: { lte: now.endOf("day").toISOString() },
      full: true,
      deleted: false,
    }),
    availabilitySlots.find({
      start: { gte: now.add(1, "day").startOf("day").toISOString() },
      end: { lte: now.add(1, "day").endOf("day").toISOString() },
      full: true,
      deleted: false,
    }),
    availabilitySlots.find({
      start: { gte: now.startOf("day").toISOString() },
      end: { lte: now.add(7, "day").endOf("day").toISOString() },
      full: true,
      deleted: false,
    }),
  ]);

  const [lessonsOfToday, lessonsOfTomorrow, lessonsOfNextWeek] =
    await Promise.all([
      await lessons.find({
        after: now.startOf("day").toISOString(),
        before: now.endOf("day").toISOString(),
        full: true,
        canceled: false,
      }),
      await lessons.find({
        after: now.add(1, "day").startOf("day").toISOString(),
        before: now.add(1, "day").endOf("day").toISOString(),
        full: true,
        canceled: false,
      }),
      await lessons.find({
        after: now.add(1, "week").startOf("day").toISOString(),
        before: now.add(1, "week").endOf("day").toISOString(),
        full: true,
        canceled: false,
      }),
    ]);

  const slotsSumOfToday = sumSlotsDuration(slotsOfToday.list);
  const slotsSumOfTomorrow = sumSlotsDuration(slotsOfTomorrow.list);
  const slotsSumOfNextWeek = sumSlotsDuration(slotsOfNextWeek.list);

  const lessonsSumOfToday = sumLessonsDuration(lessonsOfToday.list);
  const lessonsSumOfTomorrow = sumLessonsDuration(lessonsOfTomorrow.list);
  const lessonsSumOfNextWeek = sumLessonsDuration(lessonsOfNextWeek.list);

  const channel = await mattermost.getChannelByNameAndTeamName(
    "litespace",
    config.mattermost.channel
  );

  await mattermost.createPost({
    channel_id: channel.id,
    message: `
    ## LiteSpace daily report ${config.env !== "production" ? "(Unreal)" : ""}
    ### Total available teaching hours
      - Today: ${formatMinutes(slotsSumOfToday)}
      - Tomorrow: ${formatMinutes(slotsSumOfTomorrow)}
      - Next seven days (starting from today): ${formatMinutes(slotsSumOfNextWeek)}
    ### Lessons
      - Today: ${lessonsOfToday.total}
      - Tomorrow: ${lessonsOfTomorrow.total}
      - Next seven days (starting from today): ${lessonsOfNextWeek.total}
    *Canceled lessons are excluded*
    ### Utilized tutor hours
      - Today: ${formatMinutes(lessonsSumOfToday)} (${formatPercentage(lessonsSumOfToday, slotsSumOfToday)})
      - Tomorrow: ${formatMinutes(lessonsSumOfTomorrow)} (${formatPercentage(lessonsSumOfTomorrow, slotsSumOfTomorrow)})
      - Next seven days (starting from today): ${formatMinutes(lessonsSumOfNextWeek)} (${formatPercentage(lessonsSumOfNextWeek, slotsSumOfNextWeek)})
    `.replaceAll(/\n\s{4}/gi, "\n"),
  });
}

function formatMinutes(total: number): string {
  return humanizeDuration(total * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND, {
    units: ["h", "m"],
  });
}

function sumLessonsDuration(lessons: ILesson.Self[]): number {
  return sumBy(lessons, (lesson) => lesson.duration);
}

function formatPercentage(first: number, second: number): string {
  if (!second) return "0%";
  const percentage = (first / second) * 100;
  return percentage.toFixed(2) + " %";
}

export default { start };
