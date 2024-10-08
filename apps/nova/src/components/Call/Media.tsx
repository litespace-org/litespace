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
  userImage?: string;
  mateImage?: string;
  userSpeaking?: boolean;
  mateSpeaking?: boolean;
  userVideo?: boolean;
  userAudio?: boolean;
  mateVideo?: boolean;
  mateAudio?: boolean;
}> = ({
  userMediaStream,
  remoteMediaStream,
  userScreenStream,
  remoteScreenStream,
  userName,
  mateName,
  userImage,
  mateImage,
  userSpeaking,
  mateSpeaking,
  userAudio,
  userVideo,
  mateAudio,
  mateVideo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { md } = useMediaQueries();

  const screen = useMemo(() => {
    const userStream = {
      stream: userMediaStream,
      name: userName,
      screen: false,
      image: userImage,
      video: userVideo,
      audio: userAudio,
    };

    const mateStream = {
      stream: remoteMediaStream,
      name: mateName,
      screen: false,
      image: mateImage,
      video: mateVideo,
      audio: mateAudio,
    };

    const userScreen = {
      stream: userScreenStream,
      name: userName,
      screen: true,
      image: userImage,
    };

    const mateScreen = {
      stream: remoteScreenStream,
      name: mateName,
      screen: true,
      image: mateImage,
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
    mateAudio,
    mateImage,
    mateName,
    mateVideo,
    remoteMediaStream,
    remoteScreenStream,
    userAudio,
    userImage,
    userMediaStream,
    userName,
    userScreenStream,
    userVideo,
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
        <UserMedia
          stream={remoteMediaStream}
          name={mateName}
          image={mateImage}
          speaking={mateSpeaking}
          video={mateVideo}
          audio={mateAudio}
        />
      ) : null}

      {userMediaStream && !remoteMediaStream && !screen ? (
        <UserMedia
          stream={userMediaStream}
          name={userName}
          video={userVideo}
          audio={userAudio}
          image={userImage}
          speaking={userSpeaking}
          muted
        />
      ) : null}

      {twoMembersOnly && userMediaStream && md ? (
        <MovableMedia
          stream={userMediaStream}
          container={containerRef}
          name={userName}
          video={userVideo}
          audio={userAudio}
          image={userImage}
          speaking={userSpeaking}
          muted
        />
      ) : null}

      {twoMembersOnly && userMediaStream && !md ? (
        <UserMedia
          stream={userMediaStream}
          name={userName}
          video={userVideo}
          audio={userAudio}
          image={userImage}
          speaking={userSpeaking}
          muted
        />
      ) : null}

      {screen ? <Screen {...screen} containerRef={containerRef} /> : null}
    </div>
  );
};

export default Media;
