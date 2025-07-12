import { Slot } from "@/components/ManageSchedule/types";
import { ILesson } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { isSuperSlot } from "@litespace/utils";

/**
 * checks if a slot has lessons in it or not
 * @returns {boolean} True if the slot has lessons within, false otherwise.
 */
export function isLessonsOutOfRange({
  slot,
  lessons,
}: {
  slot: Slot;
  lessons: ILesson.Self[];
}): boolean {
  for (const lesson of lessons) {
    const outOfRange = !isSuperSlot(
      {
        id: slot.id,
        start: slot.start,
        end: slot.end,
      },
      {
        id: lesson.slotId,
        start: lesson.start,
        end: dayjs(lesson.start).add(lesson.duration, "minutes").toISOString(),
      }
    );

    if (outOfRange) return true;
  }
  return false;
}
