import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VideoBar } from "@/components/Session/VideoBar";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import cn from "classnames";

const Animate: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.5,
        borderRadius: "32px",
        overflow: "hidden",
      }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
      className={cn(
        "tw-aspect-video tw-relative tw-w-full tw-h-full tw-grow tw-rounded-lg tw-overflow-hidden",
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
      autoPlay
      className={cn("tw-w-full tw-aspect-video tw-absolute tw-top-0")}
      muted={muted}
      playsInline
    />
  );
};

export const FocusedStream: React.FC<{
  alert?: string;
  muted: boolean;
  stream: StreamInfo;
  timer: {
    duration: number;
    startAt: string;
  };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
}> = ({ stream, timer, alert, fullScreen, muted }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.stream)
      videoRef.current.srcObject = stream.stream;
  }, [stream.stream]);

  return (
    <div className="tw-grow tw-rounded-lg tw-overflow-hidden">
      <AnimatePresence mode="wait">
        <Animate
          className={cn(
            !stream.camera && !stream.cast && "!tw-absolute !tw-opacity-0"
          )}
          key="stream"
        >
          <Stream stream={stream.stream} muted={stream.muted} />
        </Animate>
        <Animate
          className={cn(
            (stream.cast || stream.camera) && "!tw-absolute !tw-opacity-0"
          )}
          key="avatar"
        >
          <div
            className={
              "tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center"
            }
          >
            <UserAvatar user={stream.user} speaking={stream.speaking} />
          </div>
        </Animate>
      </AnimatePresence>

      <VideoBar
        alert={alert}
        timer={timer}
        fullScreen={fullScreen}
        speaking={stream.speaking}
        muted={muted}
      />
    </div>
  );
};

export default FocusedStream;
