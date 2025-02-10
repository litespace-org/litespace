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
      actions={{
        primary: {
          label: intl("labels.share"),
          onClick: confirm,
          loading: loading,
          disabled: loading,
        },
        secondary: {
          label: intl("labels.go-back"),
          onClick: close,
        },
      }}
      close={close}
      type="warning"
      title={intl("session.share-screen.title")}
      description={intl("session.share-screen.description")}
      icon={<CastScreen />}
      open={open}
    />
  );
};
