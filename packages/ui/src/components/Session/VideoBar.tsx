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
    <div className="w-full px-6 mt-6 absolute top-0 left-0 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <FullScreenButton {...fullScreen} />
        {alert ? <Alert alert={alert} /> : null}
      </div>
      <div className="flex items-center gap-8">
        <SpeechIndicator speaking={speaking} muted={muted} variant="large" />
        <TimerIndicator {...timer} />
      </div>
    </div>
  );
};
export default VideoBar;
