import React, { useCallback, useMemo } from "react";
import { useToast } from "@litespace/ui/Toast";
import { Alert, AlertType } from "@litespace/ui/Alert";
import { Dialog } from "@litespace/ui/Dialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useDeleteRatingTutor } from "@litespace/headless/rating";
import { Void } from "@litespace/types";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";

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
  const toast = useToast();

  const onSuccess = useCallback(() => {
    invalidate([QueryKey.FindTutorRating, tutorId]);
    toast.success({ title: intl("tutor.rate.delete.success") });
    close();
  }, [invalidate, tutorId, toast, intl, close]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("tutor.rate.delete.error"),
        description: error.message,
      });
      close();
    },
    [toast, intl, close]
  );

  const deleteRating = useDeleteRatingTutor({ onSuccess, onError });

  const action = useMemo(() => {
    return {
      label: intl("labels.confirm"),
      onClick: () => deleteRating.mutate(id),
      disabled: deleteRating.isPending,
      loading: deleteRating.isPending,
    };
  }, [intl, deleteRating, id]);

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
