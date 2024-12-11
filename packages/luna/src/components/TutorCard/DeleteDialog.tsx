import React from "react";
import { Dialog } from "@/components/Dialog/V2";
import RedTrash from "@litespace/assets/RedTrash";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button, ButtonType, ButtonVariant } from "@/components/Button";

type Props = {
  studentId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onDelete: (studentId: number) => void;
};

const DeleteDialog: React.FC<Props> = ({
  studentId,
  open,
  setOpen,
  onDelete,
}) => {
  const intl = useFormatMessage();
  const onClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete(studentId);
    onClose();
  };

  return (
    <Dialog
      title={
        <div>
          <div className="tw-w-12 tw-h-48">
            <RedTrash />
          </div>
        </div>
      }
      open={open}
      setOpen={setOpen}
      close={onClose}
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

export default DeleteDialog;
