import ProfileAvatar from "@litespace/assets/ProfileAvatar";
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
      title={intl("cancel-lesson.with-tutor.confirm.title", {
        value: otherMemberName,
      })}
      open={open}
      type="main"
      icon={<ProfileAvatar className="[&>*]:!stroke-brand-500" />}
      className="!w-[400px] text-caption text-natural-700"
      actions={{
        primary: {
          label: intl("labels.confirm"),
          onClick: close,
        },
        secondary: {
          label: isStudent ? intl("labels.go-back") : intl("labels.cancel"),
          onClick: onCancel,
          loading: loading,
          disabled: loading,
        },
      }}
      close={close}
    >
      {isStudent ? (
        <div className="flex flex-col mt-1">
          <Typography tag="p">
            {intl("cancel-lesson.with-tutor.confirm.description", {
              value: otherMemberName,
            })}
          </Typography>

          <Typography tag="p">
            {intl("cancel-lesson.with-tutor.confirm.description-2")}
          </Typography>
        </div>
      ) : null}

      {!isStudent ? (
        <Typography tag="p" className="mt-1">
          {intl("cancel-lesson.description")}
        </Typography>
      ) : null}
    </ConfirmationDialog>
  );
};
