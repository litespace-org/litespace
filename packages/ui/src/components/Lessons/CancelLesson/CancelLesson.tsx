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
      icon={<CallIncoming />}
      actions={{
        primary: {
          label: intl("cancel-lesson.confirm-and-cancel"),
          onClick: onCancel,
          loading: loading,
          disabled: loading,
        },
        secondary: {
          label: intl("cancel-lesson.cancel-and-return"),
          onClick: close,
        },
      }}
      close={close}
      title={intl("cancel-lesson.title")}
      description={intl("cancel-lesson.description")}
    />
  );
};
