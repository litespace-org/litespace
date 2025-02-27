import React from "react";
import { Ready } from "@/components/Session/Ready";
import { PreSessionUserPreview } from "@/components/Session/PreSession/PreSessionUserPreview";
import { IUser, Void } from "@litespace/types";
import Actions from "@/components/Session/Actions";
import cn from "classnames";

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
  speaking: boolean;
  joining: boolean;
  join: Void;
};

export const PreSession: React.FC<Props> = ({
  stream,
  otherMember,
  currentMember,
  camera,
  mic,
  speaking,
  joining,
  join,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl w-full p-10 lg:border lg:border-natural-100 lg:bg-natural-50 lg:shadow-pre-call",
        "flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between gap-6 lg:gap-[76px]"
      )}
    >
      <div className="flex grow flex-col justify-center items-center gap-3 lg:gap-10 lg:max-w-[calc(100%-280px)]">
        <PreSessionUserPreview
          camera={camera.enabled}
          stream={stream}
          user={currentMember}
          speaking={speaking}
        />

        <Actions camera={camera} microphone={mic} />
      </div>

      <div className="shrink-0">
        <Ready
          currentMember={currentMember}
          otherMember={otherMember}
          disabled={mic.error}
          join={join}
          loading={joining}
        />
      </div>
    </div>
  );
};

export default PreSession;
