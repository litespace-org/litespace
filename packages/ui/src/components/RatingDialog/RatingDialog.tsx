import { Dialog } from "@/components/Dialog";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks/intl";
import { Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import Rate from "@litespace/assets/Rate";
import { RatingStars } from "@/components/RatingStars";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { orUndefined } from "@litespace/utils";

interface DialogProps {
  dialogTitle: string;
  contentTitle: string;
  contentDescription: string;
  maxAllowedChars: number;
  submitting: boolean;
  close: Void;
  submit: (value: number, text?: string) => void;
}

const RatingDialog: React.FC<DialogProps> = ({
  close,
  dialogTitle,
  contentTitle,
  contentDescription,
  maxAllowedChars,
  submitting,
  submit,
}) => {
  const intl = useFormatMessage();
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState<string>("");

  const ontextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    []
  );

  const handleRating = useCallback(() => {
    submit(rating, orUndefined(text));
  }, [submit, rating, text]);

  const canSubmit = useMemo(
    () => !submitting && text.length <= maxAllowedChars,
    [submitting, maxAllowedChars, text.length]
  );

  return (
    <Dialog
      open={true}
      title={
        <div className="tw-flex tw-items-center tw-gap-2">
          <Rate />
          <Typography
            element="subtitle-2"
            weight="bold"
            className="tw-text-natural-950"
          >
            {dialogTitle}
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
          {contentTitle}
        </Typography>
        <Typography
          element="caption"
          weight="regular"
          className="tw-text-natural-950 tw-text-center"
        >
          {contentDescription}
        </Typography>

        <RatingStars
          variant="xl"
          rating={rating}
          setRating={setRating}
          readonly={submitting}
        />

        <Textarea
          placeholder={intl("session.rating.text.placeholder")}
          className="tw-min-h-[138px] !tw-w-[696px]"
          disabled={submitting}
          value={text}
          maxLength={maxAllowedChars || 180}
          onChange={ontextChange}
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
