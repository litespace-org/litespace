import React, { RefObject, useMemo, useRef } from "react";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import Screen from "@/components/Call/Screen";
import { Loading, useFormatMessage, useMediaQueries } from "@litespace/luna";

type UserMediaInfo = {
  streams: {
    self: MediaStream | null;
    screen: MediaStream | null;
  };
  refs: {
    self: RefObject<HTMLVideoElement>;
    screen: RefObject<HTMLVideoElement>;
  };
  name?: string;
  image?: string;
  speaking?: boolean;
  video?: boolean;
  audio?: boolean;
};

export type MediaProps = {
  user: UserMediaInfo;
  mate: UserMediaInfo;
  userDenided: boolean;
  loadingUserStream: boolean;
};

const Media: React.FC<MediaProps> = ({
  user,
  mate,
  userDenided,
  loadingUserStream,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { md } = useMediaQueries();
  const intl = useFormatMessage();

  const screen = useMemo(() => {
    const userStream = {
      stream: user.streams.self,
      ref: user.refs.self,
      name: user.name,
      screen: false,
      image: user.image,
      video: user.video,
      audio: user.audio,
      isCurrentUser: true,
    };

    const mateStream = {
      stream: mate.streams.self,
      ref: mate.refs.self,
      name: mate.name,
      screen: false,
      image: mate.image,
      video: mate.video,
      audio: mate.audio,
      isCurrentUser: false,
    };

    const userScreen = {
      stream: user.streams.screen,
      ref: user.refs.screen,
      name: user.name,
      screen: true,
      image: user.image,
    };

    const mateScreen = {
      stream: mate.streams.self,
      ref: mate.refs.self,
      name: mate.name,
      screen: true,
      image: mate.image,
    };

    if (mate.streams.screen)
      return {
        screen: {
          stream: mate.streams.screen,
          ref: mate.refs.screen,
          name: mate.name,
        },
        others: [userStream, mateStream, userScreen],
      };

    if (user.streams.screen)
      return {
        screen: {
          stream: user.streams.screen,
          ref: user.refs.screen,
          name: user.name,
        },
        others: [userStream, mateStream, mateScreen],
      };
  }, [
    mate.audio,
    mate.image,
    mate.name,
    mate.refs.screen,
    mate.refs.self,
    mate.streams.screen,
    mate.streams.self,
    mate.video,
    user.audio,
    user.image,
    user.name,
    user.refs.screen,
    user.refs.self,
    user.streams.screen,
    user.streams.self,
    user.video,
  ]);

  const twoMembersOnly = useMemo(
    () => user.streams.self && mate.streams.self && !screen,
    [user.streams.self, mate.streams.self, screen]
  );

  return (
    <div
      className="relative flex flex-col gap-4 justify-center flex-1 w-full h-full"
      ref={containerRef}
    >
      {loadingUserStream ? (
        <Loading />
      ) : userDenided ? (
        <p className="text-center">{intl("call.user.denided")}</p>
      ) : !user.streams.self ? (
        <p className="text-center">{intl("call.no.user.stream")}</p>
      ) : null}

      {mate.streams.self && !screen ? (
        <UserMedia
          stream={mate.streams.self}
          videoRef={mate.refs.self}
          name={mate.name}
          image={mate.image}
          speaking={mate.speaking}
          video={mate.video}
          audio={mate.audio}
        />
      ) : null}

      {user.streams.self && !mate.streams.self && !screen ? (
        <UserMedia
          stream={user.streams.self}
          videoRef={user.refs.self}
          name={user.name}
          video={user.video}
          audio={user.audio}
          image={user.image}
          speaking={user.speaking}
          muted
        />
      ) : null}

      {twoMembersOnly && user.streams.self && md ? (
        <MovableMedia
          stream={user.streams.self}
          videoRef={user.refs.self}
          container={containerRef}
          name={user.name}
          video={user.video}
          audio={user.audio}
          image={user.image}
          speaking={user.speaking}
          muted
        />
      ) : null}

      {twoMembersOnly && user.streams.self && !md ? (
        <UserMedia
          stream={user.streams.self}
          videoRef={user.refs.self}
          name={user.name}
          video={user.video}
          audio={user.audio}
          image={user.image}
          speaking={user.speaking}
          muted
        />
      ) : null}

      {screen ? <Screen {...screen} containerRef={containerRef} /> : null}
    </div>
  );
};

export default Media;
