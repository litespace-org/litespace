import React from "react";
import { PreCallUserPreview, CallBar, Ready } from "@/components/Call";
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
  join: Void;
};

export const PreCall: React.FC<Props> = ({
  stream,
  otherMember,
  currentMember,
  join,
  camera,
  mic,
}) => {
  return (
    <div className="tw-rounded-2xl tw-w-full tw-p-10 tw-border tw-border-natural-100 tw-bg-natural-50 tw-shadow-pre-call tw-flex tw-items-center tw-justify-between tw-gap-[72px]">
      <div className="tw-flex tw-grow tw-flex-col tw-justify-center tw-gap-10">
        <PreCallUserPreview
          camera={camera.enabled}
          stream={stream}
          user={currentMember}
        />

        <CallBar
          items={[
            {
              active: camera.enabled,
              OnIcon: Video,
              OffIcon: VideoSlash,
              toggle: camera.toggle,
              error: camera.error,
            },
            {
              active: mic.enabled,
              OnIcon: Microphone,
              OffIcon: MicrophoneSlash,
              toggle: mic.toggle,
              error: mic.error,
            },
          ]}
        />
      </div>

      <Ready
        currentMember={currentMember}
        otherMember={otherMember}
        mic={!mic.error}
        join={join}
      />
    </div>
  );
};

export default PreCall;
