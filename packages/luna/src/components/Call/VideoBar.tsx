import React from "react";
import FullScreenButton from "./FullScreenButton";
import { InternetIndicator } from "./InternetIndicator";
import SpeechIndicator from "./SpeechIndicator";
import { Void } from "@litespace/types";
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
}> = ({ internetProblem, fullScreen, speech }) => {
  return (
    <div className="tw-mt-7 tw-mx-6 tw-absolute tw-top-0 tw-flex tw-justify-between tw-items-center">
      <div className="tw-flex tw-items-center tw-gap-8">
        <FullScreenButton {...fullScreen} />
        {internetProblem ? <InternetIndicator /> : null}
      </div>
      <div className="tw-flex tw-items-center tw-gap-8">
        <SpeechIndicator {...speech} />
        <div>TIMER</div>
      </div>
    </div>
  );
};
export default VideoBar;
