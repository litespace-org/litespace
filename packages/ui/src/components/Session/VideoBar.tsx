import React from "react";
import { Void } from "@litespace/types";
import { TimerIndicator } from "@/components/Session/TimerIndicator";
import { SpeechIndicator } from "@/components/Session/SpeechIndicator";
import { FullScreenButton } from "@/components/Session/FullScreenButton";
import { Alert } from "@/components/Session/Alert";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const VideoBar: React.FC<{
  alert?: string;
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
  speaking: boolean;
  muted: boolean;
  timer: {
    startAt: string;
    duration: number;
  };
}> = ({ alert, fullScreen, speaking, muted, timer }) => {
  return (
    <div>
      <div className="tw-w-full tw-p-4 lg:tw-px-6 lg:tw-mt-6 tw-absolute tw-top-0 tw-left-0 tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-gap-2 lg:tw-gap-8">
          <FullScreenButton {...fullScreen} />
          {alert ? <Alert alert={alert} /> : null}
        </div>
        <div className="tw-flex tw-items-center tw-gap-2 lg:tw-gap-8">
          <SpeechIndicator speaking={speaking} muted={muted} variant="large" />
          <TimerIndicator {...timer} />
        </div>
      </div>
      <Typography
        element="tiny-text"
        className={cn(
          "tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-natural-50 tw-font-semibold tw-h-[42px] tw-backdrop-blur-[15px] tw-p-3 tw-bg-background-internet"
        )}
      >
        {alert}
      </Typography>
    </div>
  );
};
export default VideoBar;
