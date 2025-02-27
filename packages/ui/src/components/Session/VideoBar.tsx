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
  chat?: boolean;
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
}> = ({ alert, fullScreen, speaking, muted, timer, chat }) => {
  return (
    <div className="flex flex-col gap-[13px]">
      <div className="w-full p-4 lg:px-6 lg:mt-6 absolute top-0 left-0 flex gap-[13px] justify-between items-center">
        <div className="flex items-center gap-2 lg:gap-8">
          <FullScreenButton {...fullScreen} chat={chat} />
          {alert ? <Alert alert={alert} /> : null}
        </div>
        <div className="flex items-center gap-2 lg:gap-8">
          <SpeechIndicator
            speaking={speaking}
            muted={muted}
            chat={chat}
            variant="large"
          />
          <TimerIndicator {...timer} />
        </div>
      </div>
      {alert ? (
        <Typography
          tag="h4"
          className={cn(
            "lg:hidden text-tiny rounded-full flex items-center justify-center text-natural-50 font-semibold h-[42px] backdrop-blur-[15px] p-3 bg-background-internet"
          )}
        >
          {alert}
        </Typography>
      ) : null}
    </div>
  );
};
export default VideoBar;
