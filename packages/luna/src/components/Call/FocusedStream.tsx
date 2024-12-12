import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoBar, CallAvatar } from "@/components/Call";
import { StreamInfo } from "@/components/Call/types";
import { Void } from "@litespace/types";
export const FocusedStream: React.FC<{
  internetProblem?: boolean;
  stream: StreamInfo;
  timer: {
    duration: number;
    startAt: string;
  };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
}> = ({ stream, timer, internetProblem, fullScreen }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.stream)
      videoRef.current.srcObject = stream.stream;
    videoRef.current?.play();
  }, [stream.stream]);

  return (
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
      {/* todo: keep the video ref alwayas accessable */}
      {stream.camera || stream.cast ? (
        <video
          ref={videoRef}
          autoPlay
          className="tw-w-full tw-aspect-video"
          muted={false}
          playsInline
        />
      ) : (
        <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center">
          <CallAvatar user={stream.user} speaking={stream.speaking} />
        </div>
      )}

      {/*
       * TODO:  animate by using opacities not the movement
       */}
      <VideoBar
        internetProblem={internetProblem}
        timer={timer}
        fullScreen={fullScreen}
        speaking={stream.speaking}
        muted={stream.muted}
      />
    </motion.div>
  );
};

export default FocusedStream;
