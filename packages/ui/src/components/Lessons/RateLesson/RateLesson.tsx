import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import React, { useCallback, useState } from "react";
import Rate from "@litespace/assets/Rate";
import { RatingStars } from "@/components/RatingStars";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";

export const RateLesson: React.FC<{
  close: Void;
  tutorName: string | null;
  rateLoading: boolean;
  initialRating?: number;
  /**
   * Whether you are rating a session or the platform itself
   */
  type: "session" | "platform";
  onRate: ({
    value,
    feedback,
  }: {
    value: number;
    feedback: string | null;
  }) => void;
}> = ({
  close,
  tutorName,
  onRate,
  rateLoading,
  type = "session",
  initialRating,
}) => {
  const intl = useFormatMessage();
  const [rating, setRating] = useState<number>(initialRating || 5);
  const [feedback, setFeedback] = useState<string>("");

  const onFeedbackChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedback(event.target.value);
    },
    []
  );

  const handleRating = useCallback(() => {
    onRate({
      value: rating,
      feedback: feedback || null,
    });
  }, [onRate, rating, feedback]);

  return (
    <Dialog
      open={true}
      title={
        <div className="tw-flex tw-items-center tw-gap-2">
          <Rate className="tw-w-6 tw-h-6 md:tw-w-8 md:tw-h-8" />
          <Typography
            tag="h2"
            className="tw-text-natural-950 tw-font-bold tw-text-subtitle-2"
          >
            {intl("session.rating.title")}
          </Typography>
        </div>
      }
      close={close}
    >
      <div className="tw-flex tw-flex-col tw-gap-6 tw-items-center tw-justify-center tw-mt-6">
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-center tw-font-bold tw-text-h4"
        >
          {type === "session"
            ? intl("session.rating.question", { tutor: tutorName })
            : intl("platform.rating.question")}
        </Typography>
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-center tw-font-regular tw-text-caption"
        >
          {type === "session"
            ? intl("session.rating.question.description")
            : intl("platform.rating.question.description")}
        </Typography>

        <RatingStars
          variant="xl"
          rating={rating}
          setRating={setRating}
          readonly={rateLoading}
        />

        <Textarea
          placeholder={intl("session.rating.text.placeholder")}
          className="tw-min-h-[138px] !tw-w-[696px]"
          disabled={rateLoading}
          value={feedback}
          onChange={onFeedbackChange}
        />

        <Button
          size={"large"}
          onClick={handleRating}
          loading={rateLoading}
          disabled={rateLoading}
          className="tw-w-full"
        >
          {intl("session.rating.send-rating")}
        </Button>
      </div>
    </Dialog>
  );
};
