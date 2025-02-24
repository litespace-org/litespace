import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import Rate from "@litespace/assets/Rate";
import { RatingStars } from "@/components/RatingStars";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";

interface DialogProps {
  title: string;
  header: string;
  description: string;
  maxAllowedCharacters?: number;
  submitting: boolean;
  initialRating?: number;
  initialFeedback?: string;
  defaults?: { rating?: number; feedback?: string | null };
  close: Void;
  submit: ({
    value,
    feedback,
  }: {
    value: number;
    feedback: string | null;
  }) => void;
  skippable?: boolean;
}

const RatingDialog: React.FC<DialogProps> = ({
  close,
  skippable,
  title,
  header,
  description,
  maxAllowedCharacters,
  submitting,
  defaults,
  submit,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const [rating, setRating] = useState<number>(defaults?.rating || 0);
  const [feedback, setFeedback] = useState<string>(defaults?.feedback || "");

  const onFeedbackChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedback(event.target.value);
    },
    []
  );

  const onSubmit = useCallback(() => {
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
      open
      className="tw-w-full md:tw-w-[659px]"
      title={
        <div className="tw-flex tw-items-center tw-gap-2">
          <Rate />
          <Typography
            tag="h1"
            className="tw-text-natural-950 tw-text-body sm:tw-text-subtitle-2 tw-font-bold"
          >
            {title}
          </Typography>
        </div>
      }
      position={mq.md ? "center" : "bottom"}
      close={close}
    >
      <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-gap-6 tw-items-center tw-justify-center tw-mt-4 sm:tw-mt-6">
        <Typography
          tag="h2"
          className="tw-text-natural-950 tw-text-center tw-text-body sm:tw-text-h4 tw-font-bold"
        >
          {header}
        </Typography>
        <Typography
          tag="p"
          className="tw-text-natural-950 tw-text-center tw-text-caption tw-font-regular"
        >
          {description}
        </Typography>

        <div
          className={cn(
            "tw-my-6 sm:tw-my-0",
            !mq.sm && "[&>div]:tw-gap-[14px]"
          )}
        >
          <RatingStars
            variant={mq.sm ? "xl" : "lg"}
            rating={rating}
            setRating={setRating}
            readonly={submitting}
          />
        </div>

        <Textarea
          value={feedback}
          disabled={submitting}
          className="tw-min-h-[138px]"
          onChange={onFeedbackChange}
          maxAllowedCharacters={maxAllowedCharacters}
          placeholder={intl("session.rating.text.placeholder")}
          state={
            feedback &&
            maxAllowedCharacters &&
            feedback.length > maxAllowedCharacters
              ? "error"
              : undefined
          }
        />

        <div className="tw-flex tw-w-full tw-gap-6">
          <Button
            size={"large"}
            onClick={onSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting || !rating}
            className="tw-w-full"
          >
            <Typography
              tag="span"
              className="tw-font-semibold tw-text-caption sm:tw-text-body"
            >
              {intl("rating-dialog.submit")}
            </Typography>
          </Button>
          <Button
            onClick={close}
            size={"large"}
            variant={"secondary"}
            disabled={!canSubmit || submitting}
            className="tw-w-full"
          >
            <Typography
              tag="span"
              className="tw-font-semibold tw-text-caption sm:tw-text-body"
            >
              {intl(skippable ? "labels.skip" : "labels.cancel")}
            </Typography>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
export default RatingDialog;
