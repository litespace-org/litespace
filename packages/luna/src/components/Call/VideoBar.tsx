import React from "react";
import { Void } from "@litespace/types";
import {
  TimerIndicator,
  SpeechIndicator,
  InternetIndicator,
  FullScreenButton,
} from "@/components/Call";

export const VideoBar: React.FC<{
  internetProblem?: boolean;
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
  speech: {
    speaking: boolean;
    mic: boolean;
  };
  timer: {
    startAt: string;
    duration: number;
  };
}> = ({ internetProblem, fullScreen, speech, timer }) => {
  return (
    <div className="tw-w-full tw-px-6 tw-mt-6 tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 tw-flex tw-justify-between tw-items-center">
      <div className="tw-flex tw-items-center tw-gap-8">
        <FullScreenButton {...fullScreen} />
        {internetProblem ? <InternetIndicator /> : null}
      </div>
      <div className="tw-flex tw-items-center tw-gap-8">
        <SpeechIndicator {...speech} variant="Large" />
        <TimerIndicator {...timer} />
      </div>
    </div>
  );
};
export default VideoBar;
