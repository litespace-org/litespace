import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import speaking from "@/components/Session/speechIndicatorAnimation.json";
import Lottie from "react-lottie";
import { Animate as AnimateOpacity } from "@/components/Animate";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

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
      className="relative w-full min-h-full !h-full grow"
    >
      {children}
    </motion.div>
  );
};

const VideoStream: React.FC<{
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

export const Stream: React.FC<{
  chat?: boolean;
  muted: boolean;
  size?: "small" | "large";
  stream: StreamInfo;
}> = ({ stream, muted, size = "large" }) => {
  const mq = useMediaQuery();

  return (
    <motion.div
      layout
      transition={{ duration: 0.3 }}
      className={cn("relative h-full !min-h-full w-full")}
    >
      {size === "small" ? (
        <div className="absolute w-full h-full bg-natural-100 blur-[15px] z-stream-background" />
      ) : null}
      <VideoStream stream={stream.stream} muted={muted} />
      <AnimatePresence mode="wait">
        {!stream.video && !stream.cast ? (
          <Animate key="avatar">
            <div className="w-full h-full min-h-full flex items-center z-stream-avatar justify-center absolute top-0 left-0 bg-natural-100">
              <UserAvatar
                variant={size}
                user={stream.user}
                speaking={stream.speaking}
              />
            </div>
          </Animate>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {!stream.audio ? (
          <AnimateOpacity key="muted-mic">
            <div
              className={cn("absolute rounded-full overflow-hidden", {
                "top-2 left-2": size === "small",
                "top-4 left-[14px] md:top-[25px] md:left-6 lg:top-8 lg:left-8":
                  size === "large",
              })}
            >
              <div
                className={cn("flex items-center justify-center relative", {
                  "w-8 h-8 md:w-10 md:h-10": size === "large",
                  "w-6 h-6 md:w-8 md:h-8": size === "small",
                })}
              >
                <div className="absolute w-full z-stream-icon-background h-full blur-[15px] bg-[#0000004D]" />
                <MicrophoneSlash
                  className={cn("z-stream-icon [&_*]:stroke-natural-50", {
                    "w-6 h-6": size === "large",
                    "w-4 h-4": size === "small",
                  })}
                />
              </div>
            </div>
          </AnimateOpacity>
        ) : null}

        {stream.audio ? (
          <AnimateOpacity key="speaking-indicator">
            <div
              className={cn(
                "absolute z-stream-icon pointer-events-none flex items-center justify-center",
                {
                  "w-6 h-6 top-2 left-2": size === "small" && !mq.md,
                  "w-8 h-8 top-2 left-2": size === "small" && mq.md,
                  "w-8 h-8 top-4 left-[14px] md:top-8 md:left-8":
                    size === "large",
                },
                !stream.speaking && "opacity-0"
              )}
            >
              <Lottie
                width={size === "small" && !mq.md ? 24 : 32}
                height={size === "small" && !mq.md ? 24 : 32}
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

export default Stream;
