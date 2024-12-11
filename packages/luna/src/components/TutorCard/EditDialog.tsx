import { Button, ButtonSize } from "@/components/Button";
import { Dialog } from "@/components/Dialog/V2";
import { Input } from "@/components/Input";
import { Card, RatingStars } from "@/components/TutorCard/TutorCard";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import MessageQuestion from "@litespace/assets/MessageQuestion";
import React, { useState } from "react";

type Props = {
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
   * fn sets the open state of the dialog
   */
  setOpen: (open: boolean) => void;
  /**
   * fn updates the rating and comment of the tutor
   */
  onUpdate: (newRating: number, newComment: string) => void;
};

const EditDialog: React.FC<Props> = ({
  studentName,
  tutorName,
  studentId,
  imageUrl,
  comment,
  rating,
  open,
  setOpen,
  onUpdate,
}) => {
  const intl = useFormatMessage();
  const [newComment, setNewComment] = useState(comment);
  const [newRating, setNewRating] = useState(rating);

  const onClose = () => {
    setOpen(false);
    setNewComment(comment);
    setNewRating(rating);
  };

  const handleUpdate = () => {
    onUpdate(newRating, newComment);
    setOpen(false);
  };

  return (
    <Dialog
      title={
        <div className="tw-flex tw-gap-2 tw-items-center">
          <MessageQuestion />
          <Typography
            element="subtitle-2"
            weight="bold"
            className="tw-text-natural-950"
          >
            {intl("student-dashboard.rating.edit")}
          </Typography>
        </div>
      }
      close={onClose}
      open={open}
      setOpen={setOpen}
      className="tw-flex tw-flex-col tw-justify-between tw-gap-8 tw-items-stretch tw-w-2/4"
    >
      <Card
        studentName={studentName}
        studentId={studentId}
        imageUrl={imageUrl}
        comment={comment}
        isCommentOwner={true}
        rating={rating}
        tutorName={tutorName}
        editSetOpen={setOpen}
        editOpened={true}
        className="tw-mx-auto"
      />
      <RatingStars
        isCommentOwner={true}
        rating={0}
        comment={comment}
        editOpened={true}
        readonly={true}
        newRating={newRating}
        setNewRate={setNewRating}
        className="hover:tw-cursor-pointer"
      />
      <div className="tw-flex tw-gap-6 tw-mt-8">
        <Input
          className="tw-h-14"
          placeholder={intl(
            "student-dashboard.rating-dialog.add-comment-placeholder"
          )}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          size={ButtonSize.Large}
          onClick={handleUpdate}
          disabled={newComment === comment && newRating === rating}
        >
          <Typography
            element="body"
            weight="bold"
            className="tw-text-natural-50"
          >
            {intl("global.labels.confirm")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};

export default EditDialog;
