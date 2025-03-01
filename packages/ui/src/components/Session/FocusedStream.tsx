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
        "relative w-full h-full grow rounded-lg overflow-hidden",
        !chat && "lg:aspect-video "
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
        "w-full h-full lg:aspect-video absolute top-0",
        hidden && "opacity-0"
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
        "rounded-2xl lg:rounded-lg grow",
        !chat && "h-full",
        chat && "relative"
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
                "w-full h-full bg-brand-100 flex items-center justify-center"
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
