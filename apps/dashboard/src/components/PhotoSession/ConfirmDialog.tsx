import { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { Void } from "@litespace/types";

export const ConfirmDialog: React.FC<{
  title: string;
  icon: React.ReactNode;
  open: boolean;
  state?: "pending" | "success" | "error";
  progress: number;
  onClose: Void;
  onTryAgain: Void;
  cancel: Void;
}> = ({ state, progress, title, icon, open, onClose, onTryAgain, cancel }) => {
  const intl = useFormatMessage();

  const progressInfo = useMemo(() => {
    if (state === "success") return intl("labels.file-upload-done");
    if (state === "error") return intl("labels.file-upload-failed");
    if (state === "pending") return intl("labels.file-upload-inprogress");
    return intl("labels.file-upload-canceled");
  }, [state, intl]);

  const primaryAction = useMemo(() => {
    if (state === "success")
      return { label: intl("labels.done"), onClick: onClose };

    if (state === "error")
      return {
        label: intl("labels.try-again"),
        onClick: onTryAgain,
      };

    return {
      label: intl("labels.cancel"),
      onClick: cancel,
      disabled: progress === 100,
    };
  }, [state, intl, onClose, onTryAgain, cancel, progress]);

  return (
    <ConfirmationDialog
      open={open}
      title={title}
      progress={{
        label: progressInfo,
        value: progress,
      }}
      actions={{
        primary: primaryAction,
        secondary:
          state === "error"
            ? {
                label: intl("labels.cancel"),
                onClick: () => onClose(),
              }
            : undefined,
      }}
      close={onClose}
      closable={state !== "pending"}
      type={state === "error" ? "error" : "main"}
      icon={icon}
    />
  );
};
