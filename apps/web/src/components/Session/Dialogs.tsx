import React from "react";
import VideoClip from "@litespace/assets/VideoClip";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { Void } from "@litespace/types";

export type DialogTypes = "encourage-dialog" | "discourage-dialog";

export type Props = {
  type: DialogTypes | null;
  setPermission: (
    permission: "mic-and-camera" | "mic-only" | "cam-only"
  ) => void;
  turnCamOff: Void;
  close: Void;
};

export const Dialogs: React.FC<Props> = ({
  type,
  setPermission,
  turnCamOff,
  close,
}) => {
  const intl = useFormatMessage();

  return (
    <>
      <ConfirmationDialog
        title={intl("encourage-dialog-title")}
        description={intl("encourage-dialog-description")}
        icon={<VideoClip />}
        open={type === "encourage-dialog"}
        closable={false}
        actions={{
          primary: {
            label: intl("labels.cam-and-mic"),
            onClick: () => {
              setPermission("mic-and-camera");
              close();
            },
          },
          secondary: {
            label: intl("labels.only-mic"),
            onClick: () => {
              setPermission("mic-only");
              close();
            },
          },
        }}
      />

      <ConfirmationDialog
        type="warning"
        title={intl("discourage-dialog-title")}
        description={intl("discourage-dialog-description")}
        icon={<VideoClip />}
        open={type === "discourage-dialog"}
        closable={false}
        actions={{
          primary: {
            label: intl("labels.continue-with-cam"),
            onClick: () => {
              setPermission("cam-only");
              close();
            },
          },
          secondary: {
            label: intl("labels.close-cam"),
            onClick: () => {
              turnCamOff();
              close();
            },
          },
        }}
      />
    </>
  );
};
