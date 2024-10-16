import React, { useMemo } from "react";
import {
  Alert,
  AlertType,
  Dialog,
  toaster,
  useFormatMessage,
} from "@litespace/luna";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteRatingTutor } from "@litespace/headless/rating";

type DeleteRatingProps = {
  open: boolean;
  close: () => void;
  id: number;
  tutorId: number;
};

const DeleteRating: React.FC<DeleteRatingProps> = ({
  id,
  tutorId,
  open,
  close,
}) => {
  const queryClient = useQueryClient();
  const intl = useFormatMessage();
  const onSuccess = () => {
    toaster.success({ title: intl("tutor.rate.delete.success") });
    queryClient.invalidateQueries({ queryKey: ["tutor-rating", tutorId] });
    close();
  };
  const onError = (error: Error) => {
    toaster.error({
      title: intl("tutor.rate.delete.error"),
      description: error.message,
    });
    close();
  };

  const deleteRating = useDeleteRatingTutor({ onSuccess, onError, id });

  const action = useMemo(() => {
    return {
      label: intl("global.labels.confirm"),
      onClick: () => deleteRating.mutate(),
      disabled: deleteRating.isPending,
      loading: deleteRating.isPending,
    };
  }, [intl, deleteRating]);
  return (
    <Dialog
      className="sm:w-1/2"
      open={open}
      close={close}
      title={intl("tutor.rate.delete.title")}
    >
      <Alert
        type={AlertType.Warning}
        title={intl("tutor.rate.delete.titleWarning")}
        action={action}
      />
    </Dialog>
  );
};

export default DeleteRating;
