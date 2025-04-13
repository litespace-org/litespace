import dayjs from "@/lib/dayjs";
import { router } from "@/lib/router";
import { Producer } from "@litespace/kafka";
import { lessons } from "@litespace/models";
import { ILesson, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";

export async function sendLessonReminders(producer: Producer) {
  const now = dayjs().tz("Africa/Cairo");

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
    const lessonStart = dayjs(data.lesson.start).tz("Africa/Cairo");

    const isStudentVerified =
      data.members.student.phone && data.members.student.verifiedPhone;

    const isTutorVerified =
      data.members.tutor.phone && data.members.tutor.verifiedPhone;

    const studentMessage = `Reminder: Your lesson with ${data.members.tutor.name} is starting in ${lessonStart.diff(now, "minutes")} minutes.
you can join by using this link: ${router.web({
      route: Web.Lesson,
      id: data.lesson.id,
      full: true,
    })}
          `;

    const tutorMessage = `Reminder: Your lesson with ${data.members.student.name} is starting in ${lessonStart.diff(now, "minutes")} minutes.
you can join by using this link: ${router.web({
      route: Web.Lesson,
      id: data.lesson.id,
      full: true,
    })}
          `;

    // ======================= Send message to Students ================

    if (data.members.student.enabledTelegram && isStudentVerified) {
      const phone = data.members.student.phone;
      producer.send({
        topic: "telegram",
        value: {
          to: phone!,
          message: studentMessage,
        },
      });
    }

    if (data.members.student.enabledWhatsapp && isStudentVerified) {
      const phone = data.members.student.phone;
      producer.send({
        topic: "whatsapp",
        value: {
          to: phone!,
          message: studentMessage,
        },
      });
    }

    // =================== Send message to Tutors ================

    if (data.members.tutor.enabledTelegram && isTutorVerified) {
      const phone = data.members.tutor.phone;
      producer.send({
        topic: "telegram",
        value: {
          to: phone!,
          message: tutorMessage,
        },
      });
    }

    if (data.members.tutor.enabledWhatsapp && isTutorVerified) {
      const phone = data.members.tutor.phone;
      producer.send({
        topic: "whatsapp",
        value: {
          to: phone!,
          message: tutorMessage,
        },
      });
    }
  });
}
