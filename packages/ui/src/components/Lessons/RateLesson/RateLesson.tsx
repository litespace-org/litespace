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
        <div className="flex items-center gap-2">
          <Rate className="w-6 h-6 md:w-8 md:h-8" />
          <Typography
            tag="h2"
            className="text-natural-950 font-bold text-subtitle-2"
          >
            {intl("session.rating.title")}
          </Typography>
        </div>
      }
      close={close}
    >
      <div className="flex flex-col gap-6 items-center justify-center mt-6">
        <Typography
          tag="span"
          className="text-natural-950 text-center font-bold text-h4"
        >
          {type === "session"
            ? intl("session.rating.question", { tutor: tutorName })
            : intl("platform.rating.question")}
        </Typography>
        <Typography
          tag="span"
          className="text-natural-950 text-center font-normal text-caption"
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
          className="min-h-[138px] !w-[696px]"
          disabled={rateLoading}
          value={feedback}
          onChange={onFeedbackChange}
        />

        <Button
          size={"large"}
          onClick={handleRating}
          loading={rateLoading}
          disabled={rateLoading}
          className="w-full"
        >
          {intl("session.rating.send-rating")}
        </Button>
      </div>
    </Dialog>
  );
};
