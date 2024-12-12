import { Void } from "@litespace/types";
import React from "react";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Chat from "@litespace/assets/Chat";
import CastScreen from "@litespace/assets/CastScreen";
import { InCallStreams, CallBar } from "@/components/Call";
import { StreamInfo } from "@/components/Call/types";

/**
 * @todo should accept list of streams
 *    - user alone => should be the main stream
 *    - two users => the other user is the focused stream.
 *    - two users with cast => cast is the focused stream.
 *    - one user with casting => cast is the focused stream.
 *    - two users with two streams => the other user cast should be focused.
 */
type Props = {
  streams: {
    focused: StreamInfo;
    unfocused: StreamInfo[];
  };
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
  leaveCall: Void;
  chatPanel?: React.ReactNode;
  internetProblem?: boolean;
};

export const Call: React.FC<Props> = ({
  chat,
  chatPanel,
  leaveCall,
  camera,
  mic,
  cast,
  streams,
  timer,
  internetProblem,
  fullScreen,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-10 tw-w-full tw-h-full">
      <div className="tw-h-full tw-grow tw-flex">
        <InCallStreams
          fullScreen={fullScreen}
          streams={streams}
          chat={chat.enabled}
          timer={timer}
          internetProblem={internetProblem}
        />
        {chat.enabled ? chatPanel : null}
      </div>
      <div className="tw-border-t tw-border-natural-400" />
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
