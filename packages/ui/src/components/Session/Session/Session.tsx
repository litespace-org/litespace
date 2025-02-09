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
import cn from "classnames";
import { AnimatePresence } from "framer-motion";
import { AnimateWidth } from "@/components/Animate";

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
  chat,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-h-full tw-gap-4 lg:tw-gap-10">
      <div
        className={cn(
          "tw-w-full tw-aspect-video tw-grow tw-border tw-border-brand-700 tw-bg-brand-100",
          "tw-rounded-lg tw-overflow-hidden tw-flex tw-flex-row tw-gap-6"
        )}
      >
        <SessionStreams
          currentUserId={currentUserId}
          fullScreen={fullScreen}
          streams={streams}
          chat={chat.enabled}
          timer={timer}
          alert={alert}
        />

        <AnimatePresence mode="wait">
          {chat.enabled ? (
            <AnimateWidth key="chat">{chatPanel}</AnimateWidth>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="tw-hidden lg:tw-block tw-border-t tw-border-natural-400" />
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
