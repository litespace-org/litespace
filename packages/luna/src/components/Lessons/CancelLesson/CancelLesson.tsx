import CallIncoming from "@litespace/assets/CallIncoming";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import React from "react";
import { Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";

export const CancelLesson: React.FC<{
  onCancel: Void;
  close: Void;
  id: number;
}> = ({ close, onCancel }) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      open={true}
      type="error"
      Icon={CallIncoming}
      close={close}
      confirm={onCancel}
      title={intl("cancel-lesson.title")}
      description={intl("cancel-lesson.description")}
      labels={{
        confirm: "cancel-lesson.confirm-and-cancel",
        cancel: "cancel-lesson.cancel-and-return",
      }}
    />
  );
};
