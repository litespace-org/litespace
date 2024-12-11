import { MenuAction } from "@/components/Menu";

export type StarProps = {
  /**
   * comment of the student on the tutor
   */
  comment?: string | null;
  /**
   * average rating of the tutor
   */
  rating: number;
  /**
   * state shows wheather the comment belongs to this student or another one
   */
  isCommentOwner: boolean;
  /**
   * state shows wheather the edit dialog is opened or not
   */
  editOpened?: boolean;
  /**
   * state shows weather stars can be clicked or not
   */
  readonly: boolean;
  /**
   * rating after update
   */
  newRating?: number;
  className?: string | null;
  /**
   * fn sets the rating value to the new one
   */
  setNewRate: (newRate: number) => void;
};

export type TutorCardProps = {
  /**
   * id of the user profile
   */
  profileId: number;
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
   * fn opens edit dialog
   */
  editSetOpen: (editOpen: boolean) => void;
  /**
   * fn opens delete dialog
   */
  deleteSetOpen: (deleteOpen: boolean) => void;
};

export type CardProps = Omit<TutorCardProps, "deleteSetOpen" | "profileId"> & {
  /**
   * state shows wheather the comment belongs to this student or another one
   */
  isCommentOwner: boolean;
  /**
   * array of actions eg: edit and delete comment
   */
  actions?: MenuAction[] | null;
  /**
   * state shows the edit dialog wheather opened or not
   */
  editOpened?: boolean;
  className?: string | null;
};
