import React from "react";
import { Ready } from "@/components/Session/Ready";
import { IUser, Void } from "@litespace/types";
import Actions from "@/components/Session/Actions";
import cn from "classnames";
import FocusedStream from "@/components/Session/FocusedStream";

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
  return (
    <div
      className={cn(
        "rounded-2xl w-full h-full",
        "flex flex-col lg:grid lg:grid-cols-[1fr,auto] lg:grid-rows-[auto,1fr] items-center lg:items-start gap-4 lg:gap-6"
      )}
    >
      <FocusedStream
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
      <div className="grow w-[306px] flex justify-center items-center h-full">
        <Ready
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
