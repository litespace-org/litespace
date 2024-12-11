import { MenuAction } from "@/components/Menu";

export type RatingCardProps = {
  /**
   * id of the user profile
   */
  profileId?: number;
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
  comment: string | null;
  /**
   * rating of the tutor bet 1, 5
   */
  rating: number;
  /**
   * image url for student own the comment
   */
  imageUrl?: string | null;
  /**
   * arr of actions to control edit and delete rating
   */
  actions?: MenuAction[];
  /**
   * state shows the dialog opened or not
   */
  active: boolean;
  className?: string;
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
  comment: string;
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
  onUpdate: (newRating: number, newComment: string) => void;
};

export type FeedbackDeleteProps = {
  /**
   * id for the deleted comment
   */
  ratingId: number;
  /**
   * state of the dialog wheather opened or not
   */
  open: boolean;
  /**
   * fn toggles the dialog
   */
  setOpen: (open: boolean) => void;
  /**
   * fn deletes the comment
   */
  onDelete: (studentId: number) => void;
};
