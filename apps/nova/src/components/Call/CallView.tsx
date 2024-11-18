import React, { useMemo, useRef } from "react";
import MainCallView from "@/components/Call/MainCallView";
import MovableMedia from "@/components/Call/MovableMedia";
import { Void } from "@litespace/types";

export type UserMediaInfo = {
  streams: {
    self: MediaStream | null;
    screen: MediaStream | null;
  };
  name?: string;
  speaking: boolean;
};

export type CallViewProps = {
  user: UserMediaInfo;
  mate: UserMediaInfo;
  fullScreen: {
    start: Void;
    exit: Void;
    enabled: boolean;
  };
};

const CallView: React.FC<CallViewProps> = ({ user, mate, fullScreen }) => {
  const container = useRef<HTMLDivElement>(null);
  const { alone, withMate } = useMemo(() => {
    return {
      // empty call
      none:
        user.streams.self === null &&
        user.streams.screen === null &&
        mate.streams.self === null &&
        mate.streams.screen === null,
      // tutor or student alone
      alone:
        user.streams.self &&
        user.streams.screen === null &&
        mate.streams.self === null &&
        mate.streams.screen === null,
      // tutor + student only
      withMate:
        user.streams.self &&
        user.streams.screen === null &&
        mate.streams.self &&
        mate.streams.screen === null,
      // tutor + student + one screen
      soloPresenter:
        user.streams.self &&
        mate.streams.self &&
        (user.streams.screen === null || mate.streams.screen === null),
      // tutor + student + two screens
      accompaniedPresenter:
        user.streams.self &&
        user.streams.screen &&
        mate.streams.self &&
        mate.streams.screen,
    };
  }, [
    mate.streams.screen,
    mate.streams.self,
    user.streams.screen,
    user.streams.self,
  ]);

  return (
    <div className="h-full" ref={container}>
      {alone && user.streams.self ? (
        <MainCallView
          stream={user.streams.self}
          title={user.name}
          fullScreen={fullScreen}
          muted
        />
      ) : null}

      {withMate && user.streams.self && mate.streams.self ? (
        <>
          <MainCallView
            stream={mate.streams.self}
            title={mate.name}
            fullScreen={fullScreen}
          />
          <MovableMedia
            stream={user.streams.self}
            container={container}
            muted
          />
        </>
      ) : null}
    </div>
  );
};

export default CallView;
