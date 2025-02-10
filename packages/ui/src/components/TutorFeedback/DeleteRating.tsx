import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { FeedbackDeleteProps } from "@/components/TutorFeedback/types";
import { useFormatMessage } from "@/hooks";
import Trash from "@litespace/assets/Trash";
import React from "react";

export const DeleteRating: React.FC<FeedbackDeleteProps> = ({
  open,
  onDelete,
  close,
  loading,
}) => {
  const intl = useFormatMessage();

  return (
    <ConfirmationDialog
      open={open}
      title={intl("tutor.rating.delete")}
      description={intl("tutor.rating.delete.warning")}
      actions={{
        primary: {
          label: intl("labels.delete"),
          onClick: onDelete,
          loading: loading,
          disabled: loading,
        },
        secondary: {
          label: intl("labels.go-back"),
          onClick: close,
        },
      }}
      close={close}
      icon={<Trash width={24} height={24} />}
      type="error"
    />
  );
};

export default DeleteRating;
