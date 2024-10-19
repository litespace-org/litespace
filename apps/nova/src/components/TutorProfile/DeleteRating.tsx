import React, { useCallback, useMemo } from "react";
import {
  Alert,
  AlertType,
  Dialog,
  toaster,
  useFormatMessage,
} from "@litespace/luna";
import { useDeleteRatingTutor } from "@litespace/headless/rating";
import { Void } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKeys } from "@litespace/headless/constants";

type DeleteRatingProps = {
  open: boolean;
  close: Void;
  id: number;
  tutorId: number;
};

const DeleteRating: React.FC<DeleteRatingProps> = ({
  id,
  tutorId,
  open,
  close,
}) => {
  const invalidate = useInvalidateQuery();
  const intl = useFormatMessage();

  const onSuccess = useCallback(() => {
    invalidate([QueryKeys.FindTutorRating, tutorId]);
    toaster.success({ title: intl("tutor.rate.delete.success") });
    close();
  }, [tutorId, id]);

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("tutor.rate.delete.error"),
        description: error.message,
      });
      close();
    },
    [tutorId, id]
  );

  const deleteRating = useDeleteRatingTutor({ onSuccess, onError });

  const action = useMemo(() => {
    return {
      label: intl("global.labels.confirm"),
      onClick: () => deleteRating.mutate(id),
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
