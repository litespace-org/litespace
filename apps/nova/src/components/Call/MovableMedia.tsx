import React from "react";
import cn from "classnames";
import { motion } from "framer-motion";
import UserMedia from "@/components/Call/UserMedia";

const MovableMedia: React.FC<{
  container: React.RefObject<HTMLDivElement>;
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
        "rounded-xl overflow-hidden absolute bottom-10 right-10 z-10 cursor-pointer w-[12.5rem] shadow-ls-x-large border border-natural-700"
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
      />
    </motion.div>
  );
};

export default MovableMedia;
