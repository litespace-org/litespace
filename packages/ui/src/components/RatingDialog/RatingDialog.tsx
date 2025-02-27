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
      className="w-full md:w-[695px]"
      title={
        <div className="flex items-center gap-2">
          <Rate className="w-6 h-6 md:w-8 md:h-8" />
          <Typography
            tag="h1"
            className="text-natural-950 text-body sm:text-subtitle-2 font-bold"
          >
            {title}
          </Typography>
        </div>
      }
      position={mq.md ? "center" : "bottom"}
      close={close}
    >
      <div className="flex flex-col gap-4 sm:gap-6 items-center justify-center mt-4 sm:mt-6">
        <Typography
          tag="h2"
          className="text-natural-950 text-center text-body sm:text-h4 font-bold"
        >
          {header}
        </Typography>
        <Typography
          tag="p"
          className="text-natural-950 text-center text-caption font-regular"
        >
          {description}
        </Typography>

        <div className={cn("my-6 sm:my-0", !mq.sm && "[&>div]:gap-[14px]")}>
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
          className="min-h-[97px]"
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

        <div className="flex w-full gap-4 md:gap-6 mt-6 md:mt-0">
          <Button
            size={"large"}
            onClick={onSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting || !rating}
            className="w-full"
          >
            <Typography
              tag="span"
              className="font-semibold md:font-medium text-caption md:text-body"
            >
              {intl("rating-dialog.submit")}
            </Typography>
          </Button>
          <Button
            onClick={close}
            size={"large"}
            variant={"secondary"}
            disabled={!canSubmit || submitting}
            className="w-full"
          >
            <Typography
              tag="span"
              className="font-semibold text-caption sm:text-body"
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
