import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import speaking from "@/components/Session/speechIndicatorAnimation.json";
import Lottie from "react-lottie";
import { Animate as AnimateOpacity } from "@/components/Animate";

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
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="relative w-full !h-full grow rounded-2xl overflow-hidden"
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
      className={cn("w-full h-full absolute top-0", hidden && "opacity-0")}
      muted={muted}
      playsInline
    />
  );
};

export const FocusedStream: React.FC<{
  chat?: boolean;
  muted: boolean;
  stream: StreamInfo;
}> = ({ stream, muted }) => {
  return (
    <motion.div
      layout
      transition={{ duration: 0.3 }}
      className="rounded-2xl grow relative w-full h-full bg-natural-100 min-h-[398px] md:min-h-[744px] lg:min-h-max lg:h-[550px]"
    >
      <Stream stream={stream.stream} muted={muted} />
      <AnimatePresence mode="wait">
        {!stream.video && !stream.cast ? (
          <Animate key="avatar">
            <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-natural-100">
              <UserAvatar user={stream.user} speaking={stream.speaking} />
            </div>
          </Animate>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {!stream.audio ? (
          <AnimateOpacity key="muted-mic">
            <div className="top-6 left-6 absolute rounded-full overflow-hidden">
              <div className="w-10 h-10 flex items-center justify-center relative">
                <div className="absolute w-full z-[9] h-full blur-[15px] bg-[#0000004D]" />
                <MicrophoneSlash className="w-6 z-10 h-6 [&_*]:stroke-natural-50" />
              </div>
            </div>
          </AnimateOpacity>
        ) : null}

        {stream.audio ? (
          <AnimateOpacity key="speaking-indicator">
            <div
              className={cn(
                "absolute w-8 h-8 top-6 left-6 pointer-events-none",
                !stream.speaking && "opacity-0"
              )}
            >
              <Lottie
                width={32}
                height={32}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: speaking,
                }}
              />
            </div>
          </AnimateOpacity>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default FocusedStream;
