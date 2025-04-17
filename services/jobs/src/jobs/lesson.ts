import dayjs from "@/lib/dayjs";
import { router } from "@/lib/router";
import { producer } from "@/lib/kafka";
import { lessons } from "@litespace/models";
import { IKafka, ILesson, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";
import { isEmpty } from "lodash";
import { safePromise } from "@litespace/utils";
import { msg } from "@/lib/bot";

const TIMEZONE = "Africa/Cairo";
const MAX_LESSON_DURATION_MINUTES = ILesson.Duration.Long;

async function send<T extends IKafka.TopicType>(
  topic: T,
  messages: IKafka.ValueOf<T>[]
) {
  if (isEmpty(messages)) return;
  await producer.send({
    topic,
    messages: messages.map((message) => ({ value: message })),
  });
}

async function sendReminders() {
  const { list } = await lessons.find({
    after: dayjs.utc().toISOString(),
    before: dayjs
      .utc()
      .add(MAX_LESSON_DURATION_MINUTES, "minutes")
      .toISOString(),
    strict: true,
    full: true,
    canceled: false,
  });

  const empty = isEmpty(list);
  msg("lesson", empty ? `found no lesson` : `found ${list.length} lesson(s)`);
  if (empty) return;

  const lessonIds = list.map((lesson) => lesson.id);
  const lessonMembers = await lessons.findLessonMembers(lessonIds);

  const whatsappMessages: Array<IKafka.ValueOf<"whatsapp">> = [];
  const telegramMessages: Array<IKafka.ValueOf<"telegram">> = [];

  for (const lesson of list) {
    const members = lessonMembers.filter(
      (member) => member.lessonId === lesson.id
    );
    const tutor = members.find((member) => member.role !== IUser.Role.Student);
    const student = members.find(
      (member) => member.role === IUser.Role.Student
    );

    if (!tutor || !student) continue;

    const now = dayjs().utc();
    const start = dayjs(lesson.start);
    // Skip lessons that are already started
    if (start.isBefore(now)) continue;
    const tz = start.tz(TIMEZONE);

    for (const member of members) {
      if (!member.notificationMethod || !member.phone || !member.verifiedPhone)
        continue;

      const url = router.web({
        route: Web.Lesson,
        id: lesson.id,
        full: true,
      });
      const message = `Your lesson will start ${tz.fromNow()}. Join here ${url}`;
      const notificationMethod = member.notificationMethod;

      if (notificationMethod === IUser.NotificationMethod.Whatsapp)
        whatsappMessages.push({ to: member.phone, message });

      if (notificationMethod === IUser.NotificationMethod.Telegram)
        telegramMessages.push({ to: member.phone, message });
    }
  }

  await send("whatsapp", whatsappMessages);
  await send("telegram", telegramMessages);

  msg(
    "lesson",
    `done. ${whatsappMessages.length} via WhatsApp. ${telegramMessages.length} vai Telegram`
  );
}

export async function sendLessonReminders() {
  msg("lesson", "starting.");
  const result = await safePromise(sendReminders());
  if (result instanceof Error)
    msg(
      "lesson",
      `lesson reminders error: ${result.message}\n\n${result.stack}`
    );
}
