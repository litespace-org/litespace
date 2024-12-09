import React, { useEffect, useRef } from "react";
import CallAvatar from "./CallAvatar";
import { Void } from "@litespace/types";
import VideoBar from "./VideoBar";

export const FocusedStream: React.FC<{
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
  timer: {
    duration: number;
    startAt: string;
  };
}> = ({ stream, timer }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.camera)
      videoRef.current.srcObject = stream.stream;
    videoRef.current?.play();
  }, [stream]);

  return (
    <div className="tw-aspect-video tw-relative tw-w-full tw-h-full tw-grow tw-rounded-lg tw-overflow-hidden">
      {stream.camera || stream.cast ? (
        <video
          ref={videoRef}
          autoPlay
          className="tw-w-full tw-aspect-video"
          muted={false}
          playsInline
        />
      ) : (
        <div className="tw-w-full tw-h-full tw-bg-brand-100 tw-flex tw-items-center tw-justify-center">
          <CallAvatar user={stream.user} />
        </div>
      )}
      <VideoBar
        timer={timer}
        fullScreen={stream.fullScreen}
        speech={stream.speech}
      />
    </div>
  );
};

export default FocusedStream;
