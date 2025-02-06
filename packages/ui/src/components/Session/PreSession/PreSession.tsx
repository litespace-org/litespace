import React from "react";
import { Ready } from "@/components/Session/Ready";
import { ActionsBar } from "@/components/Session/ActionsBar";
import { PreSessionUserPreview } from "@/components/Session/PreSession/PreSessionUserPreview";
import { IUser, Void } from "@litespace/types";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
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
        "tw-rounded-2xl tw-w-full tw-p-10 lg:tw-border lg:tw-border-natural-100 lg:tw-bg-natural-50 lg:tw-shadow-pre-call",
        "tw-flex tw-flex-col lg:tw-flex-row tw-items-center lg:tw-items-start tw-justify-center lg:tw-justify-between tw-gap-6 lg:tw-gap-[76px]"
      )}
    >
      <div className="tw-flex tw-grow tw-flex-col tw-justify-center tw-items-center tw-gap-3 lg:tw-gap-10 lg:tw-max-w-[calc(100%-280px)]">
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
          disabled={mic.error}
          join={join}
          loading={joining}
        />
      </div>
    </div>
  );
};

export default PreSession;
