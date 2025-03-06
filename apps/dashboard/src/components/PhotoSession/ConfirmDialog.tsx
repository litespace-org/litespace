import { useMemo } from "react";

import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useUpdateUser, useUploadTutorAssets } from "@litespace/headless/user";
import { Void } from "@litespace/types";

export const ConfirmDialog: React.FC<{
  title: string;
  icon: React.ReactNode;
  open: boolean;
  mutateAsset: ReturnType<typeof useUploadTutorAssets>;
  mutateUser: ReturnType<typeof useUpdateUser>;
  onClose: Void;
  onTryAgain: Void;
}> = ({ mutateAsset, mutateUser, title, icon, open, onClose, onTryAgain }) => {
  const intl = useFormatMessage();
  const succeeded = useMemo(
    () => mutateAsset.mutation.isSuccess,
    [mutateAsset.mutation.isSuccess]
  );
  const failed = useMemo(
    () => mutateAsset.mutation.isError,
    [mutateAsset.mutation.isError]
  );
  const pending = useMemo(
    () => mutateAsset.mutation.isPending || mutateUser.isPending,
    [mutateAsset.mutation.isPending, mutateUser.isPending]
  );

  const progressInfo = useMemo(() => {
    if (succeeded) return intl("labels.file-upload-done");
    if (failed) return intl("labels.file-upload-failed");
    if (pending) return intl("labels.file-upload-inprogress");
    return intl("labels.file-upload-canceled");
  }, [succeeded, failed, pending, intl]);

  const dialogPrimaryAction = useMemo(() => {
    const action = {
      label: intl("labels.close"),
      onClick: () => onClose(),
    };

    if (succeeded) {
      action.label = intl("labels.done");
    }
    // TODO: swap between labels.retry and labels.try-again in ar-eg file and all codebase
    if (failed) {
      action.label = intl("labels.try-again");
      action.onClick = () => onTryAgain();
    }
    if (pending) {
      action.label = intl("labels.cancel");
      action.onClick = () => {
        mutateAsset.abort();
        mutateAsset.mutation.reset();
      };
    }
    return action;
  }, [succeeded, failed, pending, onClose, onTryAgain, mutateAsset, intl]);

  return (
    <ConfirmationDialog
      open={open}
      title={title}
      progress={{
        label: progressInfo,
        value: mutateAsset.progress,
      }}
      actions={{
        primary: dialogPrimaryAction,
        secondary: failed
          ? {
              label: intl("labels.cancel"),
              disabled: pending,
              onClick: () => onClose(),
            }
          : undefined,
      }}
      close={pending ? undefined : () => onClose()}
      type={failed ? "error" : "main"}
      icon={icon}
    />
  );
};
