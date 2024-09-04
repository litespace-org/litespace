import React, { useEffect, useRef } from "react";
import cn from "classnames";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";

const Media: React.FC<{
  userMediaStream: MediaStream | null;
  remoteMediaStream: MediaStream | null;
  userScreenStream: MediaStream | null;
}> = ({ userMediaStream, remoteMediaStream, userScreenStream }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localCameraRef = useRef<HTMLVideoElement>(null);
  const remoteCameraRef = useRef<HTMLVideoElement>(null);
  const localSreenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localCameraRef.current)
      localCameraRef.current.srcObject = userMediaStream;
  }, [userMediaStream]);

  useEffect(() => {
    if (remoteCameraRef.current)
      remoteCameraRef.current.srcObject = remoteMediaStream;
  }, [remoteMediaStream, userMediaStream]);

  useEffect(() => {
    if (localSreenRef.current)
      localSreenRef.current.srcObject = userScreenStream;
  }, [userScreenStream]);

  return (
    <div
      className="relative flex justify-center flex-1 w-full h-full"
      ref={containerRef}
    >
      {userMediaStream && !remoteMediaStream && !userScreenStream ? (
        <UserMedia stream={userMediaStream} />
      ) : null}

      {userMediaStream && remoteMediaStream && !userScreenStream ? (
        <MovableMedia stream={userMediaStream} container={containerRef} />
      ) : null}

      {remoteMediaStream && !userScreenStream ? (
        <UserMedia stream={remoteMediaStream} />
      ) : null}

      {userScreenStream ? (
        <div className={cn("flex items-center justify-center flex-col gap-2")}>
          <div
            className={cn(
              "flex items-center justify-center w-full",
              !remoteMediaStream ? "h-full" : "h-[calc(100%-300px)]"
            )}
          >
            <UserMedia stream={userScreenStream} />
          </div>

          {userMediaStream && !remoteMediaStream ? (
            <MovableMedia stream={userMediaStream} container={containerRef} />
          ) : null}

          {userMediaStream && remoteMediaStream ? (
            <div className="flex flex-row justify-center gap-4 items-center h-[300px]">
              <UserMedia stream={userMediaStream} />
              <UserMedia stream={remoteMediaStream} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Media;
