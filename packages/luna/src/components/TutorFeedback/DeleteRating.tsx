import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { FeedbackDeleteProps } from "@/components/TutorFeedback/types";
import { useFormatMessage } from "@/hooks";
import Trash from "@litespace/assets/Trash";
import React from "react";

export const DeleteRating: React.FC<FeedbackDeleteProps> = ({
  open,
  setOpen,
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
      setOpen={setOpen}
      close={close}
      labels={{
        confirm: intl("labels.delete"),
      }}
      icon={<Trash width={24} height={24} />}
      loading={loading}
      type="error"
      confirm={onDelete}
    />
  );
};

export default DeleteRating;
