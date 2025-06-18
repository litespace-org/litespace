import dayjs from "@/lib/dayjs";
import { lessons } from "@litespace/models";
import { IKafka, IUser } from "@litespace/types";
import { isEmpty } from "lodash";
import {
  AFRICA_CAIRO_TIMEZONE,
  MAX_LESSON_DURATION,
  safePromise,
} from "@litespace/utils";
import { LessonData } from "@/types/lesson";
import { formatMessage, isValidMember } from "@/lib/lesson";
import { send, msg } from "@/lib/message";

async function getLessonData(): Promise<LessonData> {
  const { list } = await lessons.find({
    after: dayjs.utc().toISOString(),
    before: dayjs.utc().add(MAX_LESSON_DURATION, "minutes").toISOString(),
    strict: true,
    full: true,
    canceled: false,
  });

  const empty = isEmpty(list);
  if (empty) return { lessons: [], lessonMembers: [] };

  const lessonIds = list.map((lesson) => lesson.id);
  const lessonMembers = await lessons.findLessonMembers(lessonIds);

  return { lessons: list, lessonMembers };
}

async function getMessageQueue({ lessonMembers, lessons }: LessonData) {
  const whatsappMessages: Array<IKafka.ValueOf<"whatsapp">> = [];
  const telegramMessages: Array<IKafka.ValueOf<"telegram">> = [];

  for (const lesson of lessons) {
    const now = dayjs.utc();
    const start = dayjs.utc(lesson.start);
    // skip lessons that are already started
    if (start.isBefore(now)) continue;

    const tz = start.tz(AFRICA_CAIRO_TIMEZONE);
    const message = formatMessage(lesson, tz.fromNow());

    const members = lessonMembers.filter(
      (member) => member.lessonId === lesson.id
    );
    for (const member of members) {
      if (!isValidMember(member)) continue;

      const notificationMethod = member.notificationMethod;

      if (notificationMethod === IUser.NotificationMethod.Whatsapp)
        whatsappMessages.push({ to: member.phone, message });

      if (notificationMethod === IUser.NotificationMethod.Telegram)
        telegramMessages.push({ to: member.phone, message });
    }
  }
  return { whatsappMessages, telegramMessages };
}

async function sendReminders() {
  const lessonData = await getLessonData();

  const { whatsappMessages, telegramMessages } =
    await getMessageQueue(lessonData);

  await Promise.all([
    send("whatsapp", whatsappMessages),
    send("telegram", telegramMessages),
  ]);
}

async function start() {
  const result = await safePromise(sendReminders());
  if (result instanceof Error)
    msg(`lesson reminders error: ${result.message}\n\n${result.stack}`);
}

export default {
  start,
};
