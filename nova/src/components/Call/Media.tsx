import React, { useMemo, useRef } from "react";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import Screen from "@/components/Call/Screen";

const Media: React.FC<{
  userMediaStream: MediaStream | null;
  remoteMediaStream: MediaStream | null;
  userScreenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
}> = ({
  userMediaStream,
  remoteMediaStream,
  userScreenStream,
  remoteScreenStream,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const screen = useMemo(() => {
    if (remoteScreenStream)
      return {
        screenStream: remoteScreenStream,
        otherStreams: [userMediaStream, remoteMediaStream, userScreenStream],
      };

    if (userScreenStream)
      return {
        screenStream: userScreenStream,
        otherStreams: [userMediaStream, remoteMediaStream, remoteScreenStream],
      };
  }, [
    remoteMediaStream,
    remoteScreenStream,
    userMediaStream,
    userScreenStream,
  ]);

  return (
    <div
      className="relative flex justify-center flex-1 w-full h-full"
      ref={containerRef}
    >
      {userMediaStream && !remoteMediaStream && !screen ? (
        <UserMedia stream={userMediaStream} muted />
      ) : null}

      {userMediaStream && remoteMediaStream && !screen ? (
        <MovableMedia stream={userMediaStream} container={containerRef} muted />
      ) : null}

      {remoteMediaStream && !screen ? (
        <UserMedia stream={remoteMediaStream} />
      ) : null}

      {screen ? <Screen {...screen} containerRef={containerRef} /> : null}
    </div>
  );
};

export default Media;
