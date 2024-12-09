import React, { useEffect, useRef } from "react";
import CallAvatar from "./CallAvatar";
import SpeechIndicator from "./SpeechIndicator";
import { Void } from "@litespace/types";

export const UnFocusedStream: React.FC<{
  internetProblem?: boolean;
  stream: {
    fullScreen: {
      enabled: boolean;
      toggle: Void;
    };
    speech: {
      speaking: boolean;
      mic: boolean;
    };
    camera: boolean;
    cast: boolean;
    stream: MediaStream | null;
    user: {
      id: number;
      imageUrl: string | null;
      name: string | null;
    };
  };
}> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.camera)
      videoRef.current.srcObject = stream.stream;
    videoRef.current?.play();
  }, [stream]);

  return (
    <div className="tw-aspect-video tw-w-[219px] tw-border tw-border-natural-500 tw-flex tw-items-center tw-justify-center tw-backdrop-blur-[15px] tw-bg-background-indicator tw-rounded-lg tw-shadow-ls-small tw-overflow-hidden">
      {stream.camera || stream.cast ? (
        <video ref={videoRef} autoPlay muted={false} playsInline />
      ) : (
        <div className="tw-w-[120px] tw-h-[120px] tw-rounded-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center">
          <CallAvatar variant="Small" user={stream.user} />
        </div>
      )}
      <div className="tw-absolute tw-top-[8px] tw-left-[8px]">
        <SpeechIndicator
          variant="Small"
          speaking={stream.speech.speaking}
          mic={stream.speech.mic}
        />
      </div>
    </div>
  );
};

export default UnFocusedStream;
