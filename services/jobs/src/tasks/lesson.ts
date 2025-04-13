import dayjs from "@/lib/dayjs";
import { router } from "@/lib/router";
import { Producer } from "@litespace/kafka";
import { lessons } from "@litespace/models";
import { ILesson, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";

const TIMEZONE = "Africa/Cairo";

function sendReminder(
  producer: Producer,
  notificationMethod: number,
  phone: string,
  message: string
) {
  const preferredMethod = IUser.NotificationMethod[notificationMethod];

  if (preferredMethod !== "whatsapp" && preferredMethod !== "telegram") return;

  producer.send({
    topic: preferredMethod,
    value: {
      to: phone,
      message,
    },
  });
}

export async function sendLessonReminders(producer: Producer) {
  const now = dayjs().tz(TIMEZONE);

  const upcommingLessons = await lessons.find({
    after: dayjs.utc().toISOString(),
    before: dayjs.utc().add(15, "m").toISOString(),
    canceled: false,
  });

  const lessonMembers = await lessons.findLessonMembers(
    upcommingLessons.list.map((l) => l.id)
  );

  // map from lessonId to lessonData with its members
  // lessonId -> { lesson, members: { tutor, student } }
  const lessonMap = new Map<
    number,
    {
      lesson: ILesson.Self;
      members: {
        tutor: ILesson.PopuldatedMember;
        student: ILesson.PopuldatedMember;
      };
    }
  >();

  // Fill map with lesson data and members
  upcommingLessons.list.forEach((lesson) => {
    const members = lessonMembers.filter(
      (member) => member.lessonId === lesson.id
    );
    const tutor = members.find((member) => member.role !== IUser.Role.Student);
    const student = members.find(
      (member) => member.role === IUser.Role.Student
    );

    if (!tutor || !student) return;

    lessonMap.set(lesson.id, {
      lesson,
      members: {
        tutor,
        student,
      },
    });
  });

  // loop over lessonMembers and send messages
  lessonMap.forEach((data) => {
    const lessonStart = dayjs(data.lesson.start).tz(TIMEZONE);

    // ======================= Send message to Students ================

    const studentMessage = `
    Reminder: Your lesson with ${data.members.tutor.name} is starting in ${lessonStart.diff(now, "minutes")} minutes.
    You can join by using this link: ${router.web({
      route: Web.Lesson,
      id: data.lesson.id,
      full: true,
    })}
  `;

    if (
      data.members.student.notificationMethod &&
      data.members.student.phone &&
      data.members.student.verifiedPhone
    )
      sendReminder(
        producer,
        data.members.student.notificationMethod,
        data.members.student.phone,
        studentMessage
      );

    // =================== Send message to Tutors ================
    const tutorMessage = `
    Reminder: Your lesson with ${data.members.student.name} is starting in ${lessonStart.diff(now, "minutes")} minutes.
    You can join by using this link: ${router.web({
      route: Web.Lesson,
      id: data.lesson.id,
      full: true,
    })}
  `;

    if (
      data.members.tutor.notificationMethod &&
      data.members.tutor.phone &&
      data.members.tutor.verifiedPhone
    )
      sendReminder(
        producer,
        data.members.tutor.notificationMethod,
        data.members.tutor.phone,
        tutorMessage
      );
  });
}
