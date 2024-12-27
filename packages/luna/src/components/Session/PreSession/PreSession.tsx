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
  join: Void;
};

export const PreSession: React.FC<Props> = ({
  stream,
  otherMember,
  currentMember,
  camera,
  mic,
  speaking,
  join,
}) => {
  return (
    <div className="tw-rounded-2xl tw-w-full tw-p-10 tw-border tw-border-natural-100 tw-bg-natural-50 tw-shadow-pre-call tw-flex tw-items-center tw-justify-between tw-gap-[76px]">
      <div className="tw-flex tw-grow tw-flex-col tw-justify-center tw-gap-10 tw-max-w-[calc(100%-341px)]">
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

      <div className="tw-shrink-0">
        <Ready
          currentMember={currentMember}
          otherMember={otherMember}
          mic={!mic.error}
          join={join}
        />
      </div>
    </div>
  );
};

export default PreSession;
