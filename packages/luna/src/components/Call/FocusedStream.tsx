import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoBar, CallAvatar, StreamProps } from "@/components/Call";

export const FocusedStream: React.FC<{
  internetProblem?: boolean;
  stream: StreamProps;
  timer: {
    duration: number;
    startAt: string;
  };
}> = ({ stream, timer, internetProblem }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.camera)
      videoRef.current.srcObject = stream.stream;
    videoRef.current?.play();
  }, [stream]);

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
          <CallAvatar user={stream.user} />
        </div>
      )}
      <VideoBar
        internetProblem={internetProblem}
        timer={timer}
        fullScreen={stream.fullScreen}
        speech={stream.speech}
      />
    </motion.div>
  );
};

export default FocusedStream;
