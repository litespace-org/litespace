import { ILesson, ITutor } from "@litespace/types";
import { MINUTES_IN_HOUR, TOTAL_LESSON_HOURLY_RATE } from "@/constants";
import { sumBy } from "lodash";

/**
 * @param duration  {ILesson.Duration}
 * @returns scaled lesson price
 */
export function calculateLessonPrice(
  duration: ILesson.Duration,
  tutor?: ITutor.Self
): number {
  return Math.floor(
    (duration / MINUTES_IN_HOUR) * (tutor?.price ?? TOTAL_LESSON_HOURLY_RATE)
  );
}

export function sumLessonsDuration(lessons: ILesson.Self[]): number {
  return sumBy(lessons, (lesson) => lesson.duration);
}
