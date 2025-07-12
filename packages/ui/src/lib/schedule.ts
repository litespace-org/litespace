import { Slot } from "@/components/ManageSchedule/types";
import { ILesson } from "@litespace/types";
import dayjs from "@/lib/dayjs";

/**
 * checks if a slot has lessons in it or not
 * @returns `true` if there is lessons
 * @returns `false` if there is not
 */
export function hasLessonBetween({
  slot,
  lessons,
}: {
  slot: Slot;
  lessons: ILesson.Self[];
}): boolean {
  const start = dayjs.utc(slot.start);
  const end = dayjs.utc(slot.end);
  for (const lesson of lessons) {
    if (lesson.canceledBy) continue;

    if (
      dayjs.utc(lesson.start).add(lesson.duration).isAfter(end) ||
      dayjs.utc(lesson.start).isBefore(start)
    )
      return true;
  }
  return false;
}
