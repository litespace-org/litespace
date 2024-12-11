import React, { useCallback } from "react";
import { Dialog } from "@/components/Dialog/V2";
import RedTrash from "@litespace/assets/RedTrash";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button, ButtonType, ButtonVariant } from "@/components/Button";
import { FeedbackDeleteProps } from "@/components/TutorFeedback/types";

export const DeleteRating: React.FC<FeedbackDeleteProps> = ({
  ratingId,
  open,
  setOpen,
  onDelete,
}) => {
  const intl = useFormatMessage();
  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleDelete = useCallback(() => {
    onDelete(ratingId);
    onClose();
  }, [onDelete, onClose, ratingId]);

  return (
    <Dialog
      title={<RedTrash />}
      open={open}
      setOpen={setOpen}
      close={onClose}
      className="tw-max-w-[400px]"
    >
      <div className="tw-flex tw-flex-col tw-gap-1 tw-mt-4 tw-mb-8">
        <Typography
          element="body"
          weight="semibold"
          className="tw-text-natural-950"
        >
          {intl("student-dashboard.rating.delete")}
        </Typography>
        <Typography
          element="caption"
          weight="regular"
          className="tw-text-natural-700"
        >
          {intl("student-dashboard.rating.delete-message")}
        </Typography>
      </div>
      <div className="tw-flex tw-justify-between tw-gap-3">
        <Button
          type={ButtonType.Error}
          className="tw-grow"
          onClick={handleDelete}
        >
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-natural-50"
          >
            {intl("labels.delete")}
          </Typography>
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          className="tw-grow tw-border-natural-500"
          onClick={() => setOpen(false)}
        >
          <Typography
            element="body"
            weight="semibold"
            className="tw-text-natural-700"
          >
            {intl("labels.back")}
          </Typography>
        </Button>
      </div>
    </Dialog>
  );
};

export default DeleteRating;
