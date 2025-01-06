import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VideoBar } from "@/components/Session/VideoBar";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import cn from "classnames";

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      className="tw-aspect-video tw-relative tw-w-full tw-h-full tw-grow tw-rounded-lg tw-overflow-hidden"
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
        {stream.camera || stream.cast ? (
          <Animate key="stream">
            <Stream stream={stream.stream} muted={muted} />
          </Animate>
        ) : (
          <Animate key="avatar">
            <div
              className={cn(
                "tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center"
              )}
            >
              <UserAvatar user={stream.user} speaking={stream.speaking} />
            </div>
          </Animate>
        )}
      </AnimatePresence>

      <VideoBar
        alert={alert}
        timer={timer}
        fullScreen={fullScreen}
        speaking={stream.speaking}
        muted={stream.muted}
      />
    </div>
  );
};

export default FocusedStream;
