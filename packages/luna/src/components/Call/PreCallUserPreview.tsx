import React, { useEffect, useRef } from "react";
import { CallAvatar } from "@/components/Call";

export const PreCallUserPreview: React.FC<{
  camera: boolean;
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
}> = ({ stream, user, camera }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && camera) videoRef.current.srcObject = stream;
  }, [stream, camera]);

  return (
    <div className="tw-aspect-video tw-w-full tw-grow tw-max-w-[700px] tw-rounded-lg tw-shadow-ls-x-small tw-overflow-hidden">
      {camera ? (
        <video ref={videoRef} autoPlay muted={false} playsInline />
      ) : (
        <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center">
          <CallAvatar user={user} />
        </div>
      )}
    </div>
  );
};
