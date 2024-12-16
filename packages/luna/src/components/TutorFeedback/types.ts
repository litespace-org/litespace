import { Void } from "@litespace/types";

export type RatingCardProps = {
  owner?: boolean;
  /**
   * id of the owner of the comment
   */
  studentId: number;
  /**
   * name of the owner of the rating
   */
  studentName: string | null;
  /**
   * tutor name who is being rated
   */
  tutorName: string | null;
  /**
   * student comment about the tutor
   */
  feedback: string | null;
  /**
   * rating of the tutor bet 1, 5
   */
  rating: number;
  /**
   * state shows wheather in the dialog for editing or not
   */
  isEditing?: boolean;
  /**
   * image url for student own the comment
   */
  imageUrl?: string | null;
  onEdit?: Void;
  onDelete?: Void;
};

export type FeedbackEditProps = {
  /**
   * name of the owner of the rating
   */
  studentName: string;
  /**
   * id of the owner of the comment
   */
  studentId: number;
  /**
   * image url for student own the comment
   */
  imageUrl: string;
  /**
   * student comment about the tutor
   */
  feedback: string | null;
  /**
   * rating of the tutor bet 1, 5
   */
  rating: number;
  /**
   * tutor name who is being rated
   */
  tutorName: string;
  /**
   * boolean represent the state of the dialog wheather opened or not
   */
  open: boolean;
  /**
   * fn toggles the dialog
   */
  setOpen: (open: boolean) => void;
  /**
   * fn updates the rating and comment of the tutor
   */
  onUpdate: (payload: { value: number; feedback: string | null }) => void;
  onClose: Void;
};

export type FeedbackDeleteProps = {
  /**
   * state of the dialog wheather opened or not
   */
  open: boolean;
  /**
   * fn toggles the dialog
   */
  setOpen: (open: boolean) => void;
  onDelete: Void;
  close: Void;
};

export type TutorRatingCardGroupProps = {
  ratings: Array<{
    /**
     * name of the rater.
     */
    name: string | null;
    /**
     * the rater id.
     */
    userId: number;
    /**
     * rater profile image url.
     */
    imageUrl: string | null;
  }>;
  /**
   * the rating value that is shared between all users.
   */
  value: number;
  tutorName: string | null;
};
