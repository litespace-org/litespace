import { Void } from "@litespace/types";
import React from "react";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Chat from "@litespace/assets/Chat";
import CastScreen from "@litespace/assets/CastScreen";
import { ActionsBar } from "@/components/Session/ActionsBar";
import { SessionStreams } from "@/components/Session/SessionStreams";
import { StreamInfo } from "@/components/Session/types";

type Props = {
  streams: StreamInfo[];
  currentUserId: number;
  chat: { enabled: boolean; toggle: Void };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
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
  leave: Void;
  chatPanel?: React.ReactNode;
  alert?: string;
};

export const Session: React.FC<Props> = ({
  chat,
  chatPanel,
  leave,
  camera,
  mic,
  cast,
  streams,
  timer,
  alert,
  fullScreen,
  currentUserId,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-10 tw-w-full tw-h-full">
      <div className="tw-h-full tw-grow tw-flex">
        <SessionStreams
          currentUserId={currentUserId}
          fullScreen={fullScreen}
          streams={streams}
          chat={chat.enabled}
          timer={timer}
          alert={alert}
        />
        {chat.enabled ? chatPanel : null}
      </div>
      <div className="tw-border-t tw-border-natural-400" />
      <ActionsBar
        leave={leave}
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

export default Session;
