import React from "react";
import { Void } from "@litespace/types";
import { TimerIndicator } from "@/components/Call/TimerIndicator";
import { SpeechIndicator } from "@/components/Call/SpeechIndicator";
import { FullScreenButton } from "@/components/Call/FullScreenButton";
import { CallAlert } from "@/components/Call/CallAlert";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
      className="tw-w-full tw-px-6 tw-mt-6 tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 tw-flex tw-justify-between tw-items-center"
    >
      <div className="tw-flex tw-items-center tw-gap-8">
        <FullScreenButton {...fullScreen} />
        {alert ? <CallAlert alert={alert} /> : null}
      </div>
      <div className="tw-flex tw-items-center tw-gap-8">
        <SpeechIndicator speaking={speaking} muted={muted} variant="large" />
        <TimerIndicator {...timer} />
      </div>
    </motion.div>
  );
};
export default VideoBar;
