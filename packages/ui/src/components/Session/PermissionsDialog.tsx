import React, { useMemo } from "react";
import { Dialog } from "@/components/Dialog";
import Devices from "@litespace/assets/Devices";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import cn from "classnames";
import { Void } from "@litespace/types";

export type Props = {
  onSubmit: (permission: "mic-and-camera" | "mic-only") => void;
  close?: Void;
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
  close,
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
    <Dialog open={open} close={close}>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-8">
          <Devices />
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 items-center justify-center",
            errorMessage ? "mb-[19px]" : "mb-14"
          )}
        >
          <Typography
            tag="span"
            className="text-natural-950 font-bold text-subtitle-1"
          >
            {intl("session.permissions.title")}
          </Typography>
          {errorMessage ? (
            <Typography
              tag="span"
              className="text-destructive-700 font-medium text-caption"
            >
              {errorMessage}
            </Typography>
          ) : null}
          <Typography
            tag="span"
            className="text-natural-700 font-medium text-caption"
          >
            {intl("session.permissions.note")}
          </Typography>
        </div>
        <div className="flex items-center justify-center gap-6 w-fit">
          <Button
            className="shrink-0 min-w-[274px]"
            size={"large"}
            onClick={() => onSubmit("mic-and-camera")}
            loading={loading === "mic-and-camera"}
            disabled={!!loading || !devices.camera || !devices.mic}
          >
            <Typography tag="span">
              {intl("session.permissions.enable-mic-and-camera")}
            </Typography>
          </Button>
          <Button
            className="shrink-0 min-w-[274px]"
            size={"large"}
            variant={"secondary"}
            onClick={() => onSubmit("mic-only")}
            loading={loading === "mic-only"}
            disabled={!!loading || !devices.mic}
          >
            <Typography tag="span">
              {intl("session.permissions.enable-mic-only")}
            </Typography>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
