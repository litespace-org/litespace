import React from "react";
import { Dialog } from "@/components/Dialog/V2";
import Devices from "@litespace/assets/Devices";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";

export type Props = {
  onSubmit: (permission: "mic-and-camera" | "mic-only") => void;
  loading?: "mic-and-camera" | "mic-only";
  open: boolean;
};

export const PermissionsDialog: React.FC<Props> = ({
  onSubmit,
  loading,
  open,
}) => {
  const intl = useFormatMessage();
  return (
    <Dialog open={open}>
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-8">
        <div className="tw-mb-8">
          <Devices />
        </div>

        <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-14">
          <Typography
            element="subtitle-1"
            weight="bold"
            className="tw-text-natural-950 tw-mb-4"
          >
            {intl("call.permissions.title")}
          </Typography>
          <Typography
            element="caption"
            weight="medium"
            className="tw-text-natural-700"
          >
            {intl("call.permissions.note")}
          </Typography>
        </div>
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-6 tw-w-fit">
          <Button
            className="tw-shrink-0 tw-min-w-[274px]"
            size={ButtonSize.Large}
            onClick={() => onSubmit("mic-and-camera")}
            loading={loading === "mic-and-camera"}
            disabled={!!loading}
          >
            <Typography>
              {intl("call.permissions.enable-mic-and-camera")}
            </Typography>
          </Button>
          <Button
            className="tw-shrink-0 tw-min-w-[274px]"
            size={ButtonSize.Large}
            variant={ButtonVariant.Secondary}
            onClick={() => onSubmit("mic-only")}
            loading={loading === "mic-only"}
            disabled={!!loading}
          >
            <Typography>{intl("call.permissions.enable-mic-only")}</Typography>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
