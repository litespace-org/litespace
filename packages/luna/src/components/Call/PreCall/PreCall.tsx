import React from "react";
import { PreCallUserPreview, CallBar, Ready } from "@/components/Call";
import { IUser, Void } from "@litespace/types";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";

export const PreCall: React.FC<{
  stream: MediaStream | null;
  users: {
    id: number;
    imageUrl: string | null;
    name: string | null;
    gender: IUser.Gender;
    role: IUser.Role;
  }[];
  currentUser: {
    id: number;
    imageUrl: string | null;
    name: string | null;
    role: IUser.Role;
  };
  join: Void;
  toggleCamera: Void;
  camera: boolean;
  mic: boolean;
  toggleMic: Void;
  cameraError: boolean;
  micError: boolean;
}> = ({
  stream,
  users,
  join,
  camera,
  toggleCamera,
  mic,
  toggleMic,
  currentUser,
  cameraError,
  micError,
}) => {
  return (
    <div className="tw-rounded-2xl tw-w-full tw-p-10 tw-border tw-border-natural-100 tw-bg-natural-50 tw-shadow-pre-call tw-flex tw-items-center tw-justify-between tw-gap-[72px]">
      <div className="tw-flex tw-grow tw-flex-col tw-justify-center tw-gap-10">
        <PreCallUserPreview
          camera={camera}
          stream={stream}
          user={currentUser}
        />
        <CallBar
          items={[
            {
              active: camera,
              OnIcon: Video,
              OffIcon: VideoSlash,
              toggle: toggleCamera,
              error: cameraError,
            },
            {
              active: mic,
              OnIcon: Microphone,
              OffIcon: MicrophoneSlash,
              toggle: toggleMic,
              error: micError,
            },
          ]}
        />
      </div>
      <Ready
        currentUser={currentUser}
        users={users}
        join={join}
        mic={!micError}
      />
    </div>
  );
};

export default PreCall;
