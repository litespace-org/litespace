import React from "react";
import { Void } from "@litespace/types";
import CalendarRemove from "@litespace/assets/CalendarRemove";
import { useFormatMessage } from "@/hooks";
import { ConfirmationDialog } from "../ConfirmationDialog";

type Props = {
  slotId: number;
  confirm: (slotId: number) => void;
  close: Void;
  opened: boolean;
  confirming: boolean;
  setOpen?: Void;
};

export const DeleteSlotDialog: React.FC<Props> = ({
  slotId,
  confirm,
  close,
  opened,
  setOpen,
  confirming,
}) => {
  const intl = useFormatMessage();
  return (
    <ConfirmationDialog
      title={intl("manage-schedule.remove-dialog.title")}
      description={intl("manage-schedule.remove-dialog.desc")}
      type="error"
      labels={{
        confirm: intl("labels.delete"),
        cancel: intl("labels.go-back"),
      }}
      confirm={() => confirm(slotId)}
      close={close}
      open={opened}
      setOpen={setOpen}
      loading={confirming}
      icon={<CalendarRemove height={24} width={24} />}
    />
  );
};
