import React from "react";
import { motion } from "framer-motion";

export const VideoProgressbar: React.FC<{
  progressRef: React.RefObject<HTMLButtonElement>;
  currentTime: number;
  duration: number;
  buffered: number;
  seekingHandlers: {
    handleMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleMouseUp: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
}> = ({ progressRef, currentTime, duration, buffered, seekingHandlers }) => {
  return (
    <button
      type="button"
      ref={progressRef}
      onMouseDown={seekingHandlers.handleMouseDown}
      onMouseMove={seekingHandlers.handleMouseMove}
      onMouseUp={seekingHandlers.handleMouseUp}
      className="tw-grow tw-h-[12px] tw-relative tw-block"
    >
      <div className="tw-absolute tw-top-0 tw-left-0 tw-opacity-40 tw-outline tw-w-full tw-h-full tw-outline-natural-50" />
      {/* video current state */}
      <motion.div
        transition={{
          duration: 0.1,
          ease: "easeInOut",
        }}
        className="tw-absolute tw-top-0 tw-left-0 tw-bg-brand-500 tw-h-full"
        animate={{ width: `${(currentTime / duration) * 100}%` }}
      />
      {/* video buffering */}
      <motion.div
        animate={{ width: `${buffered}%` }}
        className="tw-absolute tw-top-0 tw-left-0 tw-bg-natural-50 tw-opacity-20 tw-w-full tw-h-full"
      />
    </button>
  );
};
