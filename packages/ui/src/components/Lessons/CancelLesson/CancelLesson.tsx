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
      className="!w-[400px]"
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
      <Typography
        tag="p"
        className="text-caption text-natural-700 font-cairo mt-1"
      >
        {isStudent ? (
          <>
            <Typography tag="p">
              {intl("cancel-lesson.with-tutor.confirm.description", {
                value: otherMemberName,
              })}
            </Typography>

            <Typography tag="p">
              {intl("cancel-lesson.with-tutor.confirm.description-2")}
            </Typography>
          </>
        ) : (
          intl("cancel-lesson.description")
        )}
      </Typography>
    </ConfirmationDialog>
  );
};
