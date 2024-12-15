import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { FeedbackDeleteProps } from "@/components/TutorFeedback/types";
import { useFormatMessage } from "@/hooks";
import Trash from "@litespace/assets/Trash";
import React, { useCallback } from "react";

export const DeleteRating: React.FC<FeedbackDeleteProps> = ({
  ratingId,
  open,
  setOpen,
  onDelete,
  onClose,
}) => {
  const intl = useFormatMessage();

  const handleDelete = useCallback(() => {
    onDelete(ratingId);
    onClose();
  }, [onClose, onDelete, ratingId]);

  return (
    <ConfirmationDialog
      open={open}
      title={intl("tutor.rating.delete")}
      description={intl("tutor.rating.delete.warning")}
      setOpen={setOpen}
      close={onClose}
      Icon={Trash}
      type="error"
      confirm={handleDelete}
    />
  );
};

export default DeleteRating;
