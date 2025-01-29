import React from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import CastScreen from "@litespace/assets/CastScreen";
import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";

export const ShareScreenDialog: React.FC<{
  close: Void;
  confirm: Void;
  open: boolean;
  loading?: boolean;
}> = ({ open, loading, close, confirm }) => {
  const intl = useFormatMessage();

  return (
    <ConfirmationDialog
      labels={{
        confirm: intl("labels.share"),
        cancel: intl("labels.go-back"),
      }}
      type="warning"
      title={intl("session.share-screen.title")}
      description={intl("session.share-screen.description")}
      confirm={confirm}
      close={close}
      icon={<CastScreen />}
      open={open}
      loading={loading}
    />
  );
};
