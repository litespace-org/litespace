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

const Animate: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={cn(
        "tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

const Stream: React.FC<{ stream: MediaStream | null; muted: boolean }> = ({
  stream,
  muted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={videoRef}
      className={cn("tw-w-full tw-aspect-video tw-absolute tw-top-0")}
      autoPlay
      muted={muted}
      playsInline
    />
  );
};

export const UnFocusedStream: React.FC<{
  stream: StreamInfo;
  mic: boolean;
  owner: boolean;
}> = ({ stream, mic, owner }) => {
  return (
    <motion.div
      initial={{ x: -200, y: -200 }}
      animate={{ x: 0, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="tw-aspect-video tw-w-[219px] tw-border tw-border-natural-500 tw-flex tw-items-center tw-justify-center tw-backdrop-blur-[15px] tw-bg-background-indicator tw-rounded-lg tw-shadow-ls-x-small tw-overflow-hidden"
    >
      <AnimatePresence initial={false} mode="wait">
        <Animate
          className={cn(
            !stream.camera && !stream.cast && "!tw-absolute !tw-opacity-0"
          )}
          key="stream"
        >
          <Stream stream={stream.stream} muted={stream.muted} />
        </Animate>
        <Animate
          className={cn((stream.camera || stream.cast) && "!tw-hidden")}
          key="avatar"
        >
          <div
            className={cn(
              "tw-w-[120px] tw-h-[120px] tw-rounded-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center"
            )}
          >
            <UserAvatar
              variant="small"
              user={stream.user}
              speaking={stream.speaking && mic}
            />
          </div>
        </Animate>
      </AnimatePresence>

      <div className="tw-absolute tw-top-[8px] tw-left-[8px]">
        <SpeechIndicator
          variant="small"
          speaking={stream.speaking && mic}
          muted={owner ? !mic : stream.muted}
        />
      </div>
    </motion.div>
  );
};

export default UnFocusedStream;
