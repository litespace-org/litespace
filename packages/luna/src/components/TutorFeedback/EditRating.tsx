import { Button, ButtonSize } from "@/components/Button";
import { Dialog } from "@/components/Dialog/V2";
import { Input } from "@/components/Input";
import { FeedbackEditProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import MessageQuestion from "@litespace/assets/MessageQuestion";
import React, { useCallback, useState } from "react";
import { TutorRatingCard } from "@/components/TutorFeedback";
import { RatingStars } from "@/components/RatingStars/RatingStars";

export const EditRating: React.FC<FeedbackEditProps> = ({
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
  const [newComment, setNewComment] = useState<string>(comment);
  const [newRating, setNewRating] = useState<number>(rating);

  const onClose = useCallback(() => {
    setOpen(false);
    setNewComment(comment);
    setNewRating(rating);
  }, [setOpen, comment, rating]);

  const handleUpdate = useCallback(() => {
    onUpdate(newRating, newComment);
    setOpen(false);
  }, [onUpdate, setOpen, newRating, newComment]);

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
      className="tw-flex tw-flex-col tw-justify-between tw-gap-8 tw-items-stretch tw-w-[744px]"
    >
      <TutorRatingCard
        active={true}
        studentName={studentName}
        studentId={studentId}
        imageUrl={imageUrl}
        comment={comment}
        rating={rating}
        tutorName={tutorName}
        className="tw-mx-auto tw-min-w-64 tw-min-h-[313px]"
      />
      <RatingStars
        rating={0}
        comment={comment}
        readonly={false}
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

export default EditRating;
