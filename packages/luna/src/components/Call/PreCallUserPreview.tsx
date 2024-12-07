import React, { useEffect, useRef } from "react";
import { Avatar } from "../Avatar";
import { orUndefined } from "@litespace/sol/utils";

export const PreCallUserPreview: React.FC<{
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
}> = ({ stream, user }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  return (
    <div className="tw-aspect-video tw-w-full tw-grow tw-rounded-lg tw-shadow-ls-small tw-overflow-hidden">
      {stream ? (
        <video ref={videoRef} autoPlay muted />
      ) : (
        <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center">
          <div className="tw-p-2 tw-overflow-hidden tw-rounded-full tw-border-[6px] tw-border-border-avatar tw-flex tw-items-center tw-justify-center">
            <div className="tw-w-[242px] tw-h-[242px] tw-overflow-hidden tw-rounded-full tw-border-[16px] tw-border-border-avatar tw-backdrop-blur-[15px]">
              <Avatar
                src={orUndefined(user.imageUrl)}
                alt={orUndefined(user.name)}
                seed={user.id.toString()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
