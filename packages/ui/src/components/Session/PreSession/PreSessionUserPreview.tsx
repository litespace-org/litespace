import React, { useEffect, useRef } from "react";
import { UserAvatar } from "@/components/Session/UserAvatar";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const Stream: React.FC<{ stream: MediaStream | null }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      className="w-full h-full"
      ref={videoRef}
      autoPlay
      muted
      playsInline
    />
  );
};

export const PreSessionUserPreview: React.FC<{
  camera: boolean;
  stream: MediaStream | null;
  speaking?: boolean;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
}> = ({ stream, user, camera, speaking }) => {
  return (
    <div className="w-[156px] aspect-[9/16] lg:aspect-video lg:w-full grow rounded-2xl lg:rounded-lg shadow-ls-x-small overflow-hidden">
      <AnimatePresence mode="wait">
        {camera ? (
          <Animate>
            <Stream stream={stream} />
          </Animate>
        ) : (
          <Animate key="avatar">
            <div className="w-full h-full bg-brand-100 flex items-center justify-center border border-brand-700 rounded-2xl lg:rounded-lg">
              <UserAvatar variant="small" user={user} speaking={speaking} />
            </div>
          </Animate>
        )}
      </AnimatePresence>
    </div>
  );
};
