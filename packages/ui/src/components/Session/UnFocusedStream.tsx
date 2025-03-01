import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { SpeechIndicator } from "@/components/Session/SpeechIndicator";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="w-full h-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
};

const Stream: React.FC<{
  stream: MediaStream | null;
  muted: boolean;
  hidden?: boolean;
}> = ({ stream, muted, hidden }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={videoRef}
      className={cn(
        "w-full h-full lg:aspect-video absolute top-0",
        hidden && "opacity-0"
      )}
      autoPlay
      muted={muted}
      playsInline
    />
  );
};

export const UnFocusedStream: React.FC<{
  stream: StreamInfo;
  muted: boolean;
}> = ({ stream, muted }) => {
  return (
    <motion.div
      initial={{ x: -200, y: -200 }}
      animate={{ x: 0, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="w-[109px] aspect-[9/16] lg:w-[219px] lg:aspect-video border border-natural-500 flex items-center justify-center backdrop-blur-[15px] bg-background-indicator rounded-lg shadow-ls-x-small overflow-hidden"
    >
      <AnimatePresence initial={false} mode="wait">
        {stream.video || stream.cast ? (
          <Animate key="stream">
            <Stream stream={stream.stream} muted={muted} />
          </Animate>
        ) : (
          <Animate key="avatar">
            <div
              className={cn(
                "rounded-full overflow-hidden flex items-center justify-center"
              )}
            >
              <UserAvatar
                variant="small"
                user={stream.user}
                speaking={stream.speaking}
              />
              <Stream stream={stream.stream} muted={muted} hidden />
            </div>
          </Animate>
        )}
      </AnimatePresence>

      <div className="absolute top-[8px] left-[8px]">
        <SpeechIndicator
          variant="small"
          speaking={stream.speaking}
          muted={!stream.audio}
        />
      </div>
    </motion.div>
  );
};

export default UnFocusedStream;
