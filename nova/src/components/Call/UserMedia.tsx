import React, { useEffect, useRef } from "react";
import cn from "classnames";
import { useFormatMessage } from "@litespace/luna";
import { MicOff } from "react-feather";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const UserMedia: React.FC<{
  stream: MediaStream;
  muted?: boolean;
  mode?: "cover" | "contain";
  name?: string;
  screen?: boolean;
  video?: boolean;
  audio?: boolean;
}> = ({
  stream,
  muted = false,
  name,
  mode = "cover",
  screen = false,
  video = true,
  audio = true,
}) => {
  const intl = useFormatMessage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-surface-100 border border-border-strong @container">
      <video
        autoPlay
        playsInline
        muted={muted}
        ref={videoRef}
        data-show={video}
        className={cn("w-full h-full invisible data-[show=true]:visible", {
          "object-contain": mode === "contain",
          "object-cover": mode === "cover",
        })}
      />

      <AnimatePresence>
        {!video ? (
          <motion.img
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            data-show={!video}
            src="/avatar-1.png"
            className={cn("absolute z-[1] top-0 left-0 w-full h-full", {
              "object-contain": mode === "contain",
              "object-cover": mode === "cover",
            })}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!audio ? (
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-1 left-1 z-[2] bg-background-alternative/60 p-2 rounded-full"
          >
            <MicOff className="w-4 h-4 @md:w-5 @md:h-5" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {name ? (
        <p className="absolute bottom-1 right-2 z-[2] text-white text-[0.6rem] @4xs:text-xs @xs:text-sm">
          {screen ? intl("global.labels.screen.of", { name }) : name}
        </p>
      ) : null}
    </div>
  );
};

export default UserMedia;
