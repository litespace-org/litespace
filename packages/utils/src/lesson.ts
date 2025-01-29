import { ILesson } from "@litespace/types";
import { MINUTES_IN_HOUR } from "@/constants";

/**
 * @param price {number} scaled hourly rate
 * @param duration  {ILesson.Duration}
 * @returns scaled lesson price
 */
export function calculateLessonPrice(
  hourlyRate: number,
  duration: ILesson.Duration
): number {
  return Math.floor((duration / MINUTES_IN_HOUR) * hourlyRate);
}
