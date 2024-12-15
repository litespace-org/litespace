import { Button, ButtonSize } from "@/components/Button";
import { Dialog } from "@/components/Dialog/V2";
import { Input } from "@/components/Input";
import { RatingStars } from "@/components/RatingStars/RatingStars";
import { TutorRatingCard } from "@/components/TutorFeedback";
import { FeedbackEditProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import MessageQuestion from "@litespace/assets/MessageQuestion";
import React, { useState } from "react";

export const EditRating: React.FC<FeedbackEditProps> = ({
  studentName,
  tutorName,
  studentId,
  imageUrl,
  feedback,
  rating,
  open,
  setOpen,
  onClose,
  onUpdate,
}) => {
  const intl = useFormatMessage();
  const [newFeedback, setNewFeedback] = useState<string | null>(feedback);
  const [newRating, setNewRating] = useState<number>(rating);

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
            {intl("tutor.rating.edit")}
          </Typography>
        </div>
      }
      close={onClose}
      open={open}
      setOpen={setOpen}
      className="tw-flex tw-flex-col tw-items-center tw-gap-8"
    >
      <TutorRatingCard
        studentName={studentName}
        studentId={studentId}
        imageUrl={imageUrl}
        feedback={newFeedback}
        rating={newRating}
        tutorName={tutorName}
        isEditing
      />
      <RatingStars
        variant="lg"
        rating={newRating}
        readonly={false}
        setRating={setNewRating}
      />
      <div className="tw-flex tw-gap-6 tw-w-[696px]">
        <Input
          placeholder={intl(
            "student-dashboard.rating-dialog.add-comment-placeholder"
          )}
          value={newFeedback || ""}
          onChange={(e) => setNewFeedback(e.target.value)}
        />
        <Button
          size={ButtonSize.Large}
          onClick={() =>
            onUpdate({ value: newRating, feedback: newFeedback || null })
          }
          disabled={newFeedback === feedback && newRating === rating}
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
