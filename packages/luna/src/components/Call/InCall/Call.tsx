import { Void } from "@litespace/types";
import React from "react";
import CallBar from "../CallBar";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Chat from "@litespace/assets/Chat";
import CastScreen from "@litespace/assets/CastScreen";
import { InCallUserPreview } from "../InCallUserPreview";

type CallProps = {
  stream: MediaStream | null;
  speaking: boolean;
  users: { id: number; name: string | null; imageUrl: string | null }[];
  fullScreen: { enabled: boolean; toggle: Void };
  chat: { enabled: boolean; toggle: Void };
  camera: {
    enabled: boolean;
    error?: boolean;
    toggle: Void;
  };
  cast: {
    enabled: boolean;
    error?: boolean;
    toggle: Void;
  };
  mic: {
    enabled: boolean;
    toggle: Void;
    error?: boolean;
  };
  timer: {
    duration: string;
    startAt: string;
  };
  leaveCall: Void;
  messagesComponent: React.ReactNode;
};

export const Call: React.FC<CallProps> = ({
  chat,
  messagesComponent,
  leaveCall,
  camera,
  mic,
  cast,
  fullScreen,
  speaking,
  stream,
  users,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-10 tw-w-full">
      <div>
        <InCallUserPreview
          fullScreen={fullScreen}
          speech={{ speaking, mic: mic.enabled }}
          user={users[0]}
          stream={stream}
          camera={camera.enabled}
        />
        {chat.enabled ? messagesComponent : null}
      </div>
      <hr />
      <CallBar
        leaveCall={leaveCall}
        items={[
          {
            enabled: cast.enabled,
            OnIcon: CastScreen,
            OffIcon: CastScreen,
            toggle: cast.toggle,
          },
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
          {
            enabled: chat.enabled,
            OnIcon: Chat,
            OffIcon: Chat,
            toggle: chat.toggle,
          },
        ]}
      />
    </div>
  );
};

export default Call;
