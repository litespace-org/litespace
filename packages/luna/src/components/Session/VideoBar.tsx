import React from "react";
import { Void } from "@litespace/types";
import { TimerIndicator } from "@/components/Session/TimerIndicator";
import { SpeechIndicator } from "@/components/Session/SpeechIndicator";
import { FullScreenButton } from "@/components/Session/FullScreenButton";
import { Alert } from "@/components/Session/Alert";

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
    <div className="tw-w-full tw-px-6 tw-mt-6 tw-absolute tw-top-0 tw-left-0 tw-flex tw-justify-between tw-items-center">
      <div className="tw-flex tw-items-center tw-gap-8">
        <FullScreenButton {...fullScreen} />
        {alert ? <Alert alert={alert} /> : null}
      </div>
      <div className="tw-flex tw-items-center tw-gap-8">
        <SpeechIndicator speaking={speaking} muted={muted} variant="large" />
        <TimerIndicator {...timer} />
      </div>
    </div>
  );
};
export default VideoBar;
