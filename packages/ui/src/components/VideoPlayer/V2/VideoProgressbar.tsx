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
      className="tw-grow tw-h-3 tw-relative tw-block"
    >
      <div className="tw-absolute tw-top-0 tw-left-0 tw-opacity-40 tw-w-full tw-h-full tw-border tw-border-natural-50 " />
      <motion.div // video current state
        transition={{ duration: 0.1, ease: "easeInOut" }}
        className="tw-absolute tw-top-[2px] tw-left-[2px] tw-bg-brand-500 tw-h-2"
        animate={{ width: `${(currentTime / duration) * 100}%` }}
      />
      <motion.div // video buffering state
        animate={{ width: `${buffered}%` }}
        className="tw-absolute tw-top-[2px] tw-left-[2px] tw-bg-natural-50 tw-opacity-20 tw-w-full tw-h-2"
      />
    </button>
  );
};
