import React, { useMemo, useRef } from "react";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import Screen from "@/components/Call/Screen";
import { useMediaQueries } from "@litespace/luna/hooks/media";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

const Media: React.FC<{
  userMediaStream: MediaStream | null;
  remoteMediaStream: MediaStream | null;
  userScreenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  loadingUserStream: boolean;
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
  userDenided: boolean;
}> = ({
  userMediaStream,
  remoteMediaStream,
  userScreenStream,
  remoteScreenStream,
  loadingUserStream,
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
  userDenided,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { md } = useMediaQueries();
  const intl = useFormatMessage();

  const screen = useMemo(() => {
    const userStream = {
      stream: userMediaStream,
      name: userName,
      screen: false,
      image: userImage,
      video: userVideo,
      audio: userAudio,
      isCurrentUser: true,
    };

    const mateStream = {
      stream: remoteMediaStream,
      name: mateName,
      screen: false,
      image: mateImage,
      video: mateVideo,
      audio: mateAudio,
      isCurrentUser: false,
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
      className="relative flex flex-col justify-center flex-1 w-full h-full gap-4"
      ref={containerRef}
    >
      {loadingUserStream ? (
        <Loading />
      ) : userDenided ? (
        <p className="text-center">{intl("session.user.denided")}</p>
      ) : !userMediaStream ? (
        <p className="text-center">{intl("session.no.user.stream")}</p>
      ) : null}

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
