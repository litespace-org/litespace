import React, { useEffect, useRef } from "react";
import cn from "classnames";
import { useFormatMessage } from "@litespace/luna";
import { MicOff } from "react-feather";
import { AnimatePresence, motion } from "framer-motion";
import { asFullAssetUrl } from "@/lib/atlas";

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
  image?: string;
}> = ({
  stream,
  name,
  mode = "cover",
  muted = false,
  screen = false,
  video = true,
  audio = true,
  image,
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
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn(
              "absolute z-[1] top-0 left-0 w-full h-full",
              "flex items-center justify-center"
            )}
          >
            <div className="w-16 h-16 @3xs:w-[5rem] @3xs:h-[5rem] @2xs:w-24 @2xs:h-24 @xs:w-32 @xs:h-32 @sm:w-44 @sm:h-44 @lg:w-60 @lg:h-60  @xl:w-64 @xl:h-64 rounded-full ring-4 ring-border-strong overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={image ? asFullAssetUrl(image) : "/avatar-1.png"}
              />
            </div>
          </motion.div>
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
