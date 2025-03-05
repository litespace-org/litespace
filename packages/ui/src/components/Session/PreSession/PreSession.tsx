import React from "react";
import { Ready } from "@/components/Session/Ready";
import { IUser, Void } from "@litespace/types";
import Actions from "@/components/Session/Actions";
import cn from "classnames";
import FocusedStream from "@/components/Session/FocusedStream";

export type Props = {
  stream: MediaStream | null;
  otherMember: {
    id: number;
    imageUrl: string | null;
    name: string | null;
    gender: IUser.Gender;
    role: IUser.Role;
    incall: boolean;
  };
  currentMember: {
    id: number;
    imageUrl: string | null;
    name: string | null;
    role: IUser.Role;
  };
  camera: {
    enabled: boolean;
    toggle: Void;
    error?: boolean;
  };
  mic: {
    enabled: boolean;
    toggle: Void;
    error?: boolean;
  };
  sessionDetails: {
    sessionStart: string;
    sessionEnd: string;
  };
  speaking: boolean;
  joining: boolean;
  join: Void;
};

export const PreSession: React.FC<Props> = ({
  stream,
  otherMember,
  currentMember,
  camera,
  sessionDetails,
  mic,
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
        muted={!mic.enabled}
        stream={{
          stream,
          speaking,
          audio: mic.enabled,
          video: camera.enabled,
          user: currentMember,
          cast: false,
        }}
      />
      <div className="grow w-[306px] flex justify-center items-center h-full lg:min-h-max lg:h-[550px]">
        <Ready
          error={mic.error}
          otherMember={otherMember}
          sessionDetails={sessionDetails}
          disabled={mic.error}
          join={join}
          loading={joining}
        />
      </div>
      <Actions camera={camera} microphone={mic} />
    </div>
  );
};

export default PreSession;
