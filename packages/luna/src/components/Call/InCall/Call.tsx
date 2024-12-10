import { Void } from "@litespace/types";
import React from "react";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Chat from "@litespace/assets/Chat";
import CastScreen from "@litespace/assets/CastScreen";
import { InCallStreams, CallBar } from "@/components/Call";

export type StreamProps = {
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
  speech: {
    speaking: boolean;
    mic: boolean;
  };
  camera: boolean;
  cast: boolean;
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  type: "focused" | "unfocused";
};

type CallProps = {
  streams: StreamProps[];
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
    duration: number;
    startAt: string;
  };
  leaveCall: Void;
  messagesComponent?: React.ReactNode;
  internetProblem?: boolean;
};

export const Call: React.FC<CallProps> = ({
  chat,
  messagesComponent,
  leaveCall,
  camera,
  mic,
  cast,
  streams,
  timer,
  internetProblem,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-10 tw-w-full tw-h-full">
      <div className="tw-h-full tw-grow tw-flex">
        <InCallStreams
          streams={streams}
          chat={chat.enabled}
          timer={timer}
          internetProblem={internetProblem}
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
