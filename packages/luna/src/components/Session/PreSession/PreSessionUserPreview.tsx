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
      className="tw-w-full tw-h-full"
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

  return <video ref={videoRef} autoPlay muted playsInline />;
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
    <div className="tw-aspect-video tw-w-full tw-grow tw-rounded-lg tw-shadow-ls-x-small tw-overflow-hidden">
      <AnimatePresence mode="wait">
        {camera ? (
          <Animate>
            <Stream stream={stream} />
          </Animate>
        ) : (
          <Animate key="avatar">
            <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center tw-border tw-border-brand-700 tw-rounded-lg">
              <UserAvatar user={user} speaking={speaking} />
            </div>
          </Animate>
        )}
      </AnimatePresence>
    </div>
  );
};
