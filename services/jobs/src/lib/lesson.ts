import { ILesson } from "@litespace/types";
import { router } from "@/lib/router";
import { Web } from "@litespace/utils/routes";
import { ValidLessonMember } from "@/types/lesson";

export function formatMessage(lesson: ILesson.Self, time: string): string {
  const url = router.web({
    route: Web.Lesson,
    id: lesson.id,
    full: true,
  });

  return `Your lesson will start in ${time}. Join here ${url}`;
}

export function isValidMember(
  member: ILesson.PopuldatedMember
): member is ValidLessonMember {
  return (
    member.notificationMethod !== undefined &&
    member.phone !== null &&
    member.verifiedPhone !== undefined
  );
}
