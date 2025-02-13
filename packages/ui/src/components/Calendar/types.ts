import { IAvailabilitySlot } from "@litespace/types";

export type LessonActions = {
  onCancel(id: number): void;
  onEdit({
    lessonId,
    otherMemberId,
  }: {
    lessonId: number;
    otherMemberId: number;
  }): void;
  onRebook(id: number): void;
  onJoin(id: number): void;
};

export type SlotActions = {
  onEdit(slot: IAvailabilitySlot.Slot): void;
  onDelete(id: number): void;
};

export type EventProps = {
  id: number;
  /**
   * ISO string date time
   */
  start: string;
  /**
   * ISO string date time
   */
  end: string;
};

export type LessonProps = EventProps & {
  /**
   * When rendered to a student we show the tutor image and name.
   * When renderd to a tutor we do the opposite.
   */
  otherMember: {
    id: number;
    image: string | null;
    name: string | null;
  };
  /**
   * boolean value indicates whether the lesson has been canceled or not
   */
  canceled: boolean;
};

export type AvailabilitySlotProps = EventProps & {
  members: Array<{
    id: number;
    image: string | null;
    name: string | null;
  }>;
};

/**
 * @deprecated
 * this type is temporarily exported for compatibility with legacy code.
 */
export interface IEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  wrapper: boolean | null;
}
