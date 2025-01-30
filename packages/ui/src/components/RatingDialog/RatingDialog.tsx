import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import Rate from "@litespace/assets/Rate";
import { RatingStars } from "@/components/RatingStars";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Textarea } from "@/components/Textarea";

interface DialogProps {
  title: string;
  header: string;
  description: string;
  maxAllowedCharacters?: number;
  submitting: boolean;
  initialRating?: number;
  initialFeedback?: string;
  close: Void;
  submit: ({
    value,
    feedback,
  }: {
    value: number;
    feedback: string | null;
  }) => void;
  bottom?: boolean;
}

const RatingDialog: React.FC<DialogProps> = ({
  close,
  title,
  header,
  description,
  maxAllowedCharacters,
  submitting,
  initialRating,
  initialFeedback,
  submit,
  bottom,
}) => {
  const intl = useFormatMessage();
  const [rating, setRating] = useState<number>(initialRating || 5);
  const [feedback, setFeedback] = useState<string>(initialFeedback || "");

  const onFeedbackChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedback(event.target.value);
    },
    []
  );

  const handleRating = useCallback(() => {
    submit({ value: rating, feedback: feedback || null });
  }, [submit, rating, feedback]);

  const canSubmit = useMemo(
    () =>
      !submitting &&
      (!maxAllowedCharacters || feedback.length <= maxAllowedCharacters),
    [submitting, maxAllowedCharacters, feedback.length]
  );

  return (
    <Dialog
      open={true}
      className="tw-w-full md:tw-w-[659px]"
      position={bottom ? "bottom" : "center"}
      title={
        <div className="tw-flex tw-items-center tw-gap-2">
          <Rate />
          <Typography
            element="subtitle-2"
            weight="bold"
            className="tw-text-natural-950"
          >
            {title}
          </Typography>
        </div>
      }
      close={close}
    >
      <div className="tw-flex tw-flex-col tw-gap-6 tw-items-center tw-justify-center tw-mt-6">
        <Typography
          element="h4"
          weight="bold"
          className="tw-text-natural-950 tw-text-center"
        >
          {header}
        </Typography>
        <Typography
          element="caption"
          weight="regular"
          className="tw-text-natural-950 tw-text-center"
        >
          {description}
        </Typography>

        <RatingStars
          variant="xl"
          rating={rating}
          setRating={setRating}
          readonly={submitting}
        />

        <Textarea
          value={feedback}
          disabled={submitting}
          className="tw-min-h-[138px]"
          onChange={onFeedbackChange}
          maxAllowedCharacters={maxAllowedCharacters}
          placeholder={intl("session.rating.text.placeholder")}
          // state={
          //   feedback &&
          //   maxAllowedCharacters &&
          //   feedback.length > maxAllowedCharacters
          //     ? "error"
          //     : undefined
          // }
          state={"error"}
        />

        <div className="tw-flex tw-w-full tw-gap-6">
          <Button
            size={ButtonSize.Large}
            onClick={handleRating}
            loading={submitting}
            disabled={!canSubmit}
            className="tw-w-full"
          >
            {intl("rating-dialog.submit")}
          </Button>
          <Button
            onClick={close}
            size={ButtonSize.Large}
            variant={ButtonVariant.Secondary}
            loading={submitting}
            disabled={!canSubmit}
            className="tw-w-full"
          >
            {intl("labels.skip")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
export default RatingDialog;
