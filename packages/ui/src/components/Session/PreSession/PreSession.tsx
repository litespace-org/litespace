import React from "react";
import { Ready } from "@/components/Session/Ready";
import { IUser, Void } from "@litespace/types";
import Actions from "@/components/Session/Actions";
import cn from "classnames";
import Stream from "@/components/Session/Stream";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export type Props = {
  stream: MediaStream | null;
  members: {
    current: {
      id: number;
      imageUrl: string | null;
      name: string | null;
      role: IUser.Role;
    };
    other: {
      id: number;
      gender: IUser.Gender;
      role: IUser.Role;
      incall: boolean;
    };
  };
  video: {
    enabled: boolean;
    toggle: Void;
    error?: boolean;
  };
  audio: {
    enabled: boolean;
    toggle: Void;
    error?: boolean;
  };
  session: {
    /**
     * ISO UTC date.
     */
    start: string;
    duration: number;
  };
  speaking: boolean;
  joining: boolean;
  join: Void;
};

export const PreSession: React.FC<Props> = ({
  stream,
  members,
  video,
  session,
  audio,
  speaking,
  joining,
  join,
}) => {
  const mq = useMediaQuery();
  return (
    <div
      id="pre-session"
      className={cn(
        "rounded-2xl lg:w-full h-full max-h-[calc(100vh-160px)] lg:max-h-full",
        "flex flex-col lg:grid lg:grid-cols-[1fr,auto] lg:grid-rows-[auto,1fr] items-center lg:items-start gap-4 lg:gap-6"
      )}
    >
      <div className="h-full w-full rounded-2xl flex items-stretch relative overflow-hidden bg-natural-100">
        <Stream
          muted
          mirror
          aspect={mq.lg ? "desktop" : "mobile"}
          stream={{
            stream,
            speaking,
            audio: audio.enabled,
            video: video.enabled,
            user: members.current,
            cast: false,
          }}
        />
      </div>
      <div className="grow w-[306px] flex justify-center items-center lg:h-full">
        <Ready
          error={audio.error}
          otherMember={members.other}
          start={session.start}
          duration={session.duration}
          disabled={audio.error}
          join={join}
          loading={joining}
        />
      </div>
      <Actions video={video} audio={audio} />
    </div>
  );
};

export default PreSession;
