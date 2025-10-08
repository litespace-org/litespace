import { ILesson } from "@litespace/types";
import { MINUTES_IN_HOUR, TOTAL_LESSON_HOURLY_RATE } from "@/constants";

/**
 * @param duration  {ILesson.Duration}
 * @returns scaled lesson price
 */
export function calculateLessonPrice(duration: ILesson.Duration): number {
  return Math.floor((duration / MINUTES_IN_HOUR) * TOTAL_LESSON_HOURLY_RATE);
}
