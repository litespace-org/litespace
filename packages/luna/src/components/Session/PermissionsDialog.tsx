import React, { useMemo } from "react";
import { Dialog } from "@/components/Dialog/V2";
import Devices from "@litespace/assets/Devices";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button, ButtonSize, ButtonVariant } from "@/components/Button";
import cn from "classnames";

export type Props = {
  onSubmit: (permission: "mic-and-camera" | "mic-only") => void;
  loading?: "mic-and-camera" | "mic-only";
  open: boolean;
  devices: {
    /**
     * `true` in case the user has a working mic connected.
     */
    mic: boolean;
    /**
     * `true` in case the user has a working camera connected.
     */
    camera: boolean;
    /**
     * `true` in case the user has a working speakers connected.
     */
    speakers: boolean;
  };
};

export const PermissionsDialog: React.FC<Props> = ({
  onSubmit,
  loading,
  open,
  devices,
}) => {
  const intl = useFormatMessage();

  const errorMessage = useMemo(() => {
    if (!devices.speakers) return intl("session.permissions.no-speakers");
    if (!devices.camera && !devices.mic)
      return intl("session.permissions.no-camera-or-mic");
    if (!devices.mic) return intl("session.permissions.no-mic");
    if (!devices.camera) return intl("session.permissions.no-camera");
  }, [devices.camera, devices.mic, devices.speakers, intl]);

  return (
    <Dialog open={open}>
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div className="tw-mb-8">
          <Devices />
        </div>

        <div
          className={cn(
            "tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center",
            errorMessage ? "tw-mb-[19px]" : "tw-mb-14"
          )}
        >
          <Typography
            element="subtitle-1"
            weight="bold"
            className="tw-text-natural-950"
          >
            {intl("session.permissions.title")}
          </Typography>
          {errorMessage ? (
            <Typography
              element="caption"
              weight="medium"
              className="tw-text-destructive-700"
            >
              {errorMessage}
            </Typography>
          ) : null}
          <Typography
            element="caption"
            weight="medium"
            className="tw-text-natural-700"
          >
            {intl("session.permissions.note")}
          </Typography>
        </div>
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-6 tw-w-fit">
          <Button
            className="tw-shrink-0 tw-min-w-[274px]"
            size={ButtonSize.Large}
            onClick={() => onSubmit("mic-and-camera")}
            loading={loading === "mic-and-camera"}
            disabled={!!loading || !devices.camera || !devices.mic}
          >
            <Typography>
              {intl("session.permissions.enable-mic-and-camera")}
            </Typography>
          </Button>
          <Button
            className="tw-shrink-0 tw-min-w-[274px]"
            size={ButtonSize.Large}
            variant={ButtonVariant.Secondary}
            onClick={() => onSubmit("mic-only")}
            loading={loading === "mic-only"}
            disabled={!!loading || !devices.mic}
          >
            <Typography>
              {intl("session.permissions.enable-mic-only")}
            </Typography>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
