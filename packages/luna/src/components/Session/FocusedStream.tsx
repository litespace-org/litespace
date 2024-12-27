import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoBar } from "@/components/Session/VideoBar";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import cn from "classnames";

export const FocusedStream: React.FC<{
  alert?: string;
  streamMuted: boolean;
  stream: StreamInfo;
  timer: {
    duration: number;
    startAt: string;
  };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
}> = ({ stream, timer, alert, fullScreen, streamMuted }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.stream)
      videoRef.current.srcObject = stream.stream;
    videoRef.current?.play();
  }, [stream.stream]);

  return (
    <div className="tw-grow tw-rounded-lg tw-overflow-hidden">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        key={stream.user.id}
        className="tw-aspect-video tw-relative tw-w-full tw-h-full tw-grow tw-rounded-lg tw-overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          className={cn(
            "tw-w-full tw-aspect-video tw-absolute tw-top-0",
            !stream.stream || (!stream.camera && !stream.cast && "tw-opacity-0")
          )}
          muted={streamMuted}
          playsInline
        />
        <div
          className={cn(
            "tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center",
            (stream.camera || stream.cast) && "tw-opacity-0"
          )}
        >
          <UserAvatar user={stream.user} speaking={stream.speaking} />
        </div>
      </motion.div>

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
