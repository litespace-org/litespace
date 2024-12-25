import { Button, ButtonSize } from "@/components/Button";
import { Dialog } from "@/components/Dialog/V2";
import { Input } from "@/components/Input";
import { RatingStars } from "@/components/RatingStars/RatingStars";
import { TutorRatingCard } from "@/components/TutorFeedback";
import { RateDialogProps } from "@/components/TutorFeedback/types";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import MessageQuestion from "@litespace/assets/MessageQuestion";
import React, { useState } from "react";

/**
 * This dialog will be used for both editing ratings and creating new rating
 * The reason they are used for this is because they are similar in design
 */
export const RatingDialog: React.FC<RateDialogProps> = ({
  studentName,
  tutorName,
  studentId,
  imageUrl,
  feedback,
  rating,
  open,
  loading,
  setOpen,
  onClose,
  onSubmit,
}) => {
  const intl = useFormatMessage();
  const [newFeedback, setNewFeedback] = useState<string | null>(feedback);
  const [newRating, setNewRating] = useState<number>(rating || 0);

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
            {rating
              ? intl("tutor.rating.edit")
              : intl("tutor.rating.rate", { tutor: tutorName })}
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
            onSubmit({ value: newRating, feedback: newFeedback || null })
          }
          disabled={
            loading || (newFeedback === feedback && newRating === rating)
          }
          loading={loading}
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

export default RatingDialog;
