import { Void } from "@litespace/types";

export type BasePastLessonProps = {
  lessons: Array<{
    id: number;
    start: string;
    duration: number;
    /**
     * Current user id
     */
    currentMember: number;
    /**
     * Student in case user is tutor and vice versa
     */
    otherMember: {
      id: number;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  tutorsRoute: string;
  /**
   * `true` in case the current user is a tutor or tutor manager.
   */
  isTutor?: boolean;
  loading?: boolean;
  error?: boolean;
  /**
   * The lesson with the same id as `sendingMessage` will have the loading button state.
   */
  sendingMessage?: number;
  /**
   * State of sending message disable present in the end of each row of the table.
   */
  onRebook?: (tutorId: number) => void;
  onSendMessage?: (lessonId: number, members: number[]) => void;
  retry?: Void;
};
