import React from "react";
import { Ready } from "@/components/Session/Ready";
import { IUser, Void } from "@litespace/types";
import Actions from "@/components/Session/Actions";
import cn from "classnames";
import Stream from "@/components/Session/Stream";
import { SessionType } from "@/components/Session/types";

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
  type?: SessionType;
  speaking: boolean;
  joining: boolean;
  join: Void;
};

export const PreSession: React.FC<Props> = ({
  type = "lesson",
  stream,
  members,
  video,
  session,
  audio,
  speaking,
  joining,
  join,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl w-full h-full",
        "flex flex-col lg:grid lg:grid-cols-[1fr,auto] lg:grid-rows-[auto,1fr] items-center lg:items-start gap-4 lg:gap-6"
      )}
    >
      <div className="h-full w-full rounded-2xl flex items-stretch relative overflow-hidden min-h-[398px] bg-natural-100 md:min-h-[744px] md:h-[744px] lg:min-h-max lg:h-[550px]">
        <Stream
          muted
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
      <div className="grow w-[306px] flex justify-center items-center h-full">
        <Ready
          type={type}
          error={audio.error}
          otherMember={members.other}
          start={session.start}
          duration={session.duration}
          disabled={video.error}
          join={join}
          loading={joining}
        />
      </div>
      <Actions video={video} audio={audio} />
    </div>
  );
};

export default PreSession;
