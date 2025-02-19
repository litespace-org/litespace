import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VideoBar } from "@/components/Session/VideoBar";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import cn from "classnames";

const Animate: React.FC<{ children: React.ReactNode; chat?: boolean }> = ({
  children,
  chat,
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
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn(
        "tw-relative tw-w-full tw-h-full tw-grow tw-rounded-lg tw-overflow-hidden",
        !chat && "lg:tw-aspect-video "
      )}
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
      autoPlay
      className={cn(
        "tw-w-full tw-h-full lg:tw-aspect-video tw-absolute tw-top-0",
        hidden && "tw-opacity-0"
      )}
      muted={muted}
      playsInline
    />
  );
};

export const FocusedStream: React.FC<{
  chat?: boolean;
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
}> = ({ stream, timer, alert, fullScreen, muted, chat }) => {
  return (
    <motion.div
      layout
      transition={{ duration: 0.3 }}
      style={{
        marginInlineStart:
          chat && (stream.video || stream.cast) ? "1.5rem" : "0rem",
        marginTop: chat && (stream.video || stream.cast) ? "3.5rem" : "0rem",
      }}
      className={cn(
        "tw-rounded-2xl lg:tw-rounded-lg tw-grow",
        !chat && "tw-h-full",
        chat && "tw-relative"
      )}
    >
      <AnimatePresence mode="wait">
        {stream.video || stream.cast ? (
          <Animate chat={chat} key="stream">
            <Stream stream={stream.stream} muted={muted} />
          </Animate>
        ) : (
          <Animate chat={chat} key="avatar">
            <div
              className={cn(
                "tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center"
              )}
            >
              <UserAvatar user={stream.user} speaking={stream.speaking} />
              <Stream stream={stream.stream} muted={muted} hidden />
            </div>
          </Animate>
        )}
      </AnimatePresence>

      <VideoBar
        chat={chat}
        alert={alert}
        timer={timer}
        fullScreen={fullScreen}
        speaking={stream.speaking}
        muted={!stream.audio}
      />
    </motion.div>
  );
};

export default FocusedStream;
