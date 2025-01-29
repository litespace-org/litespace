import CallIncoming from "@litespace/assets/CallIncoming";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import React from "react";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";

export const CancelLesson: React.FC<{
  onCancel: Void;
  close: Void;
  open: boolean;
  loading?: boolean;
}> = ({ open, loading, close, onCancel }) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      open={open}
      type="error"
      loading={loading}
      icon={<CallIncoming />}
      close={close}
      confirm={onCancel}
      title={intl("cancel-lesson.title")}
      description={intl("cancel-lesson.description")}
      labels={{
        confirm: intl("cancel-lesson.confirm-and-cancel"),
        cancel: intl("cancel-lesson.cancel-and-return"),
      }}
    />
  );
};
