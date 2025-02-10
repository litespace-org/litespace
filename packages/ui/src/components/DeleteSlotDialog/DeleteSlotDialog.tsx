import React from "react";
import { Void } from "@litespace/types";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import { useFormatMessage } from "@/hooks";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

type Props = {
  slotId: number;
  confirm: Void;
  close: Void;
  opened: boolean;
  deleting: boolean;
  /**
   * `normal` in case the slot doesn't has associated lessons or interviews.
   * Otherwise, it should be `high`
   */
  severity: "normal" | "high";
};

export const DeleteSlotDialog: React.FC<Props> = ({
  confirm,
  close,
  opened,
  deleting,
  severity,
}) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      title={intl("manage-schedule.remove-dialog.title")}
      description={
        severity === "normal"
          ? intl("manage-schedule.remove-dialog.severity-normal")
          : intl("manage-schedule.remove-dialog.severity-high")
      }
      type="error"
      actions={{
        primary: {
          label: intl("labels.delete"),
          onClick: confirm,
          loading: deleting,
          disabled: deleting,
        },
        secondary: {
          label: intl("labels.go-back"),
          onClick: close,
        },
      }}
      close={close}
      open={opened}
      icon={<CalendarRemove height={24} width={24} />}
    />
  );
};
