import React from "react";
import { Ready } from "@/components/Session/Ready";
import { ActionsBar } from "@/components/Session/ActionsBar";
import { PreSessionUserPreview } from "@/components/Session/PreSession/PreSessionUserPreview";
import { IUser, Void } from "@litespace/types";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";

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
    <div className="rounded-2xl w-full p-10 border border-natural-100 bg-natural-50 shadow-pre-call flex items-center justify-between gap-[76px]">
      <div className="flex grow flex-col justify-center gap-10 max-w-[calc(100%-280px)]">
        <PreSessionUserPreview
          camera={camera.enabled}
          stream={stream}
          user={currentMember}
          speaking={speaking}
        />

        <ActionsBar
          items={[
            {
              enabled: camera.enabled,
              OnIcon: Video,
              OffIcon: VideoSlash,
              toggle: camera.toggle,
              error: camera.error,
            },
            {
              enabled: mic.enabled,
              OnIcon: Microphone,
              OffIcon: MicrophoneSlash,
              toggle: mic.toggle,
              error: mic.error,
            },
          ]}
        />
      </div>

      <div className="shrink-0 w-[280px]">
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
