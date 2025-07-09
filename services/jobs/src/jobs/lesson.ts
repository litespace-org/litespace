import dayjs from "@/lib/dayjs";
import { router } from "@/lib/router";
import { producer } from "@/lib/kafka";
import { lessons } from "@litespace/models";
import { IKafka, ILesson, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";
import { isEmpty } from "lodash";
import {
  AFRICA_CAIRO_TIMEZONE,
  MAX_LESSON_DURATION,
  safePromise,
} from "@litespace/utils";
import { msg } from "@/lib/bot";

async function start() {
  const result = await safePromise(sendReminders());
  if (result instanceof Error)
    msg(
      "lesson",
      `lesson reminders error: ${result.message}\n\n${result.stack}`
    );
}

async function sendReminders() {
  const { list } = await lessons.find({
    after: dayjs.utc().toISOString(),
    before: dayjs.utc().add(MAX_LESSON_DURATION, "minutes").toISOString(),
    strict: true,
    full: true,
    canceled: false,
  });

  if (isEmpty(list)) return;

  const whatsappMessages: Array<IKafka.Message> = [];
  const telegramMessages: Array<IKafka.Message> = [];

  const lessonIds = list.map((lesson) => lesson.id);
  const lessonMembers = await lessons.findLessonMembers(lessonIds);

  for (const lesson of list) {
    const members = lessonMembers.filter(
      (member) => member.lessonId === lesson.id
    );
    const msgs = getReminerMsgsForLessonMembers({
      members,
      lessonId: lesson.id,
      lessonStart: dayjs(lesson.start),
    });
    whatsappMessages.push(
      ...msgs.filter((msg) => msg.topic === "whatsapp").map((msg) => msg.value)
    );
    telegramMessages.push(
      ...msgs.filter((msg) => msg.topic === "telegram").map((msg) => msg.value)
    );
  }

  await send("whatsapp", whatsappMessages);
  await send("telegram", telegramMessages);
}

function getReminerMsgsForLessonMembers({
  members,
  lessonId,
  lessonStart,
}: {
  members: ILesson.PopulatedMember[];
  lessonId: number;
  lessonStart: dayjs.Dayjs;
}): Array<IKafka.Topics> {
  const tutor = members.find((member) => member.role !== IUser.Role.Student);
  const student = members.find((member) => member.role === IUser.Role.Student);

  if (!tutor || !student) return [];

  const now = dayjs().utc();
  // skip lessons that are already started
  if (lessonStart.isBefore(now)) return [];

  const res: Array<IKafka.Topics> = [];

  for (const member of members) {
    const msg = getReminderMsgForMember({
      member,
      lessonId,
      lessonStart,
    });
    if (msg) res.push(msg);
  }

  return res;
}

function getReminderMsgForMember({
  member,
  lessonId,
  lessonStart,
}: {
  member: ILesson.PopulatedMember;
  lessonId: number;
  lessonStart: dayjs.Dayjs;
}): IKafka.Topics | null {
  const tz = lessonStart.tz(AFRICA_CAIRO_TIMEZONE);
  const expiresAt = dayjs.utc(lessonStart).toISOString();

  if (!member.notificationMethod || !member.phone || !member.verifiedPhone)
    return null;

  const url = router.web({
    route: Web.Lesson,
    id: lessonId,
    full: true,
  });
  const message = `Your lesson will start ${tz.fromNow()}. Join here ${url}`;
  const notifyByWhatsapp =
    member.notificationMethod === IUser.NotificationMethod.Whatsapp;

  return {
    topic: notifyByWhatsapp ? "whatsapp" : "telegram",
    value: {
      to: member.phone,
      message,
      expiresAt,
    },
  };
}

async function send<T extends IKafka.TopicType>(
  topic: T,
  messages: IKafka.Message[]
) {
  if (isEmpty(messages)) return;
  await producer.send({
    topic,
    messages: messages.map((message) => ({ value: message })),
  });
}

export default { start };
