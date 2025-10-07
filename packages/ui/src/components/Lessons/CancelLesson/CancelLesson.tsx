import CallIncoming from "@litespace/assets/CallIncoming";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import React from "react";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";

export const CancelLesson: React.FC<{
  onCancel: Void;
  close: Void;
  open: boolean;
  loading?: boolean;
  otherMemberName?: string | null;
  isStudent?: boolean;
}> = ({ open, loading, otherMemberName, isStudent, close, onCancel }) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      open={open}
      type="error"
      icon={<CallIncoming />}
      actions={{
        primary: {
          label: intl("labels.confirm"),
          onClick: onCancel,
          loading: loading,
          disabled: loading,
        },
        secondary: {
          label: isStudent ? intl("labels.go-back") : intl("labels.cancel"),
          onClick: close,
        },
      }}
      close={close}
      title={intl("cancel-lesson.with-tutor.confirm.title", {
        value: otherMemberName,
      })}
    >
      <Typography tag="p" className="text-caption mt-4">
        {intl(
          isStudent
            ? "cancel-lesson.with-tutor.confirm.description"
            : "cancel-lesson.description"
        )}
      </Typography>
    </ConfirmationDialog>
  );
};
