import React, { useEffect, useRef } from "react";
import { UserAvatar } from "@/components/Session/UserAvatar";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && camera) videoRef.current.srcObject = stream;
  }, [stream, camera]);

  return (
    <div className="tw-aspect-video tw-w-full tw-grow tw-rounded-lg tw-shadow-ls-x-small tw-overflow-hidden">
      {camera ? (
        <video ref={videoRef} autoPlay muted={false} playsInline />
      ) : (
        <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center tw-border tw-border-brand-700 tw-rounded-lg">
          <UserAvatar user={user} speaking={speaking} />
        </div>
      )}
    </div>
  );
};
