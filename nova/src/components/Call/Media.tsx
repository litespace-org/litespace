import React, { useMemo, useRef } from "react";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import Screen from "@/components/Call/Screen";
import { useMediaQueries } from "@litespace/luna";

const Media: React.FC<{
  userMediaStream: MediaStream | null;
  remoteMediaStream: MediaStream | null;
  userScreenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  userName?: string;
  mateName?: string;
}> = ({
  userMediaStream,
  remoteMediaStream,
  userScreenStream,
  remoteScreenStream,
  userName,
  mateName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { md } = useMediaQueries();

  const screen = useMemo(() => {
    const userStream = {
      stream: userMediaStream,
      name: userName,
      screen: false,
    };
    const mateStream = {
      stream: remoteMediaStream,
      name: mateName,
      screen: false,
    };
    const userScreen = {
      stream: userScreenStream,
      name: userName,
      screen: true,
    };
    const mateScreen = {
      stream: remoteScreenStream,
      name: mateName,
      screen: true,
    };

    if (remoteScreenStream)
      return {
        screen: { stream: remoteScreenStream, name: mateName },
        others: [userStream, mateStream, userScreen],
      };

    if (userScreenStream)
      return {
        screen: { stream: userScreenStream, name: userName },
        others: [userStream, mateStream, mateScreen],
      };
  }, [
    mateName,
    remoteMediaStream,
    remoteScreenStream,
    userMediaStream,
    userName,
    userScreenStream,
  ]);

  const twoMembersOnly = useMemo(
    () => userMediaStream && remoteMediaStream && !screen,
    [remoteMediaStream, screen, userMediaStream]
  );

  return (
    <div
      className="relative flex flex-col gap-4 justify-center flex-1 w-full h-full"
      ref={containerRef}
    >
      {remoteMediaStream && !screen ? (
        <UserMedia stream={remoteMediaStream} name={mateName} />
      ) : null}

      {userMediaStream && !remoteMediaStream && !screen ? (
        <UserMedia stream={userMediaStream} muted name={userName} />
      ) : null}

      {twoMembersOnly && userMediaStream && md ? (
        <MovableMedia
          stream={userMediaStream}
          container={containerRef}
          name={userName}
          muted
        />
      ) : null}

      {twoMembersOnly && userMediaStream && !md ? (
        <UserMedia stream={userMediaStream} muted name={userName} />
      ) : null}

      {screen ? <Screen {...screen} containerRef={containerRef} /> : null}
    </div>
  );
};

export default Media;
