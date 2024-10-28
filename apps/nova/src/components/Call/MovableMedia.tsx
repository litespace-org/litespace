import React, { RefObject } from "react";
import cn from "classnames";
import { motion } from "framer-motion";
import UserMedia from "@/components/Call/UserMedia";

const MovableMedia: React.FC<{
  container: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  stream: MediaStream;
  muted?: boolean;
  name?: string;
  screen?: boolean;
  video?: boolean;
  audio?: boolean;
  image?: string;
  speaking?: boolean;
}> = ({
  container,
  videoRef,
  stream,
  muted,
  name,
  screen,
  video,
  audio,
  image,
  speaking,
}) => {
  return (
    <motion.div
      id={stream.id}
      drag
      draggable
      dragElastic
      dragConstraints={container}
      whileDrag={{ scale: 1.03 }}
      dragMomentum={false}
      className={cn(
        "rounded-xl overflow-hidden absolute bottom-10 right-10 z-10 cursor-pointer w-[300px] shadow-lg border-b-0"
      )}
    >
      <UserMedia
        stream={stream}
        muted={muted}
        name={name}
        screen={screen}
        audio={audio}
        video={video}
        image={image}
        speaking={speaking}
        videoRef={videoRef}
      />
    </motion.div>
  );
};

export default MovableMedia;
