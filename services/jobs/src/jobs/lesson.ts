import dayjs from "@/lib/dayjs";
import { router } from "@/lib/router";
import { lessons } from "@litespace/models";
import { ILesson, IMessenger, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";
import { isEmpty } from "lodash";
import { AFRICA_CAIRO_TIMEZONE, safePromise } from "@litespace/utils";
import { msg } from "@/lib/bot";
import { sendMsg } from "@/lib/messager";

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
    before: dayjs.utc().add(15, "minutes").toISOString(),
    strict: true,
    full: true,
    canceled: false,
    reported: false,
  });

  if (isEmpty(list)) return;

  const whatsappMessages: Array<IMessenger.Message> = [];

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
    whatsappMessages.push(...msgs);
  }

  console.log({
    lessons: list,
    lessonMembers,
    whatsappMessages,
  });

  await send(whatsappMessages);
}

function getReminerMsgsForLessonMembers({
  members,
  lessonId,
  lessonStart,
}: {
  members: ILesson.PopulatedMember[];
  lessonId: number;
  lessonStart: dayjs.Dayjs;
}): Array<IMessenger.Message> {
  const tutor = members.find((member) => member.role !== IUser.Role.Student);
  const student = members.find((member) => member.role === IUser.Role.Student);

  if (!tutor || !student) return [];

  const now = dayjs().utc();
  // skip lessons that are already started
  if (lessonStart.isBefore(now)) return [];

  const res: Array<IMessenger.Message> = [];

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
}): IMessenger.Message | null {
  const tz = lessonStart.tz(AFRICA_CAIRO_TIMEZONE);

  if (!member.notificationMethod || !member.phone) return null;

  const url = router.web({
    route: Web.Lesson,
    id: lessonId,
    full: true,
  });

  return {
    to: member.phone,
    template: {
      name: "lesson_reminder",
      parameters: {
        time: tz.fromNow(),
        url,
      },
    },
    method: member.notificationMethod,
  };
}

async function send(messages: IMessenger.Message[]) {
  if (isEmpty(messages)) return;
  for (const msg of messages)
    sendMsg({ ...msg, method: msg.method || null }, true);
}

export default { start };
