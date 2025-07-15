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
      className="grow h-3 relative block"
    >
      <div className="absolute top-0 left-0 opacity-40 w-full h-full border border-natural-50" />
      <motion.div // video current state
        transition={{ duration: 0.1, ease: "easeInOut" }}
        className="absolute top-[2px] left-[2px] bg-brand-500 h-2"
        animate={{ width: `${(currentTime / duration) * 100}%` }}
      />
      <motion.div // video buffering state
        animate={{ width: `${buffered}%` }}
        className="absolute top-[2px] left-[2px] bg-natural-50 opacity-20 w-full h-2"
      />
    </button>
  );
};
