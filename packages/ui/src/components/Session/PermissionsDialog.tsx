import React, { useMemo } from "react";
import { Dialog } from "@/components/Dialog";
import Devices from "@litespace/assets/Devices";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import cn from "classnames";
import { Void } from "@litespace/types";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
  const mq = useMediaQuery();
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
      <div
        className={cn(
          "flex flex-col items-center h-full justify-center",
          "min-w-[328px] md:w-[586px]"
        )}
      >
        <div className="mb-4 md:mb-8">
          <Devices className="w-[196px] h-[172px] md:w-[298px] md:h-[260px]" />
        </div>

        <div
          className={cn("flex flex-col grow gap-2 items-center text-center")}
        >
          <Typography
            tag="span"
            className="text-natural-950 font-bold text-body md:text-subtitle-1"
          >
            {intl("session.permissions.title")}
          </Typography>
          {errorMessage ? (
            <Typography
              tag="span"
              className="text-destructive-700 font-normal md:font-medium text-tiny md:text-caption"
            >
              {errorMessage}
            </Typography>
          ) : null}
          <Typography
            tag="span"
            className="text-natural-700 font-normal md:font-medium text-tiny md:text-caption"
          >
            {intl("session.permissions.note")}
          </Typography>
        </div>

        <div
          className={cn(
            "flex items-center justify-center gap-2 md:gap-3 mt-4 w-full"
          )}
        >
          <Button
            className="flex-1 md:w-full md:flex-auto"
            size={mq.md ? "large" : "medium"}
            onClick={() => onSubmit("mic-and-camera")}
            loading={loading === "mic-and-camera"}
            disabled={!!loading || !devices.camera || !devices.mic}
          >
            <Typography tag="span" className="shrink-0">
              {intl(
                mq.lg
                  ? "session.permissions.enable-mic-and-camera"
                  : "session.permissions.enable-mic-and-camera.mobile"
              )}
            </Typography>
          </Button>
          <Button
            className="md:w-full"
            size={mq.md ? "large" : "medium"}
            variant="secondary"
            onClick={() => onSubmit("mic-only")}
            loading={loading === "mic-only"}
            disabled={!!loading || !devices.mic}
          >
            <Typography tag="span" className="shrink-0">
              {intl(
                mq.lg
                  ? "session.permissions.enable-mic-only"
                  : "session.permissions.enable-mic-only.mobile"
              )}
            </Typography>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
