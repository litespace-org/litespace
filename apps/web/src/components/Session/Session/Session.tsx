import { Void } from "@litespace/types";
import React from "react";
import { Actions } from "@/components/Session/Actions";
import { SessionStreams } from "@/components/Session/SessionStreams";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export type Props = {
  streams: StreamInfo[];
  currentUserId: number;
  chat: { enabled: boolean; toggle: Void };
  video: {
    enabled: boolean;
    error?: boolean;
    toggle: Void;
  };
  cast?: {
    enabled: boolean;
    error?: boolean;
    toggle: Void;
  };
  audio: {
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
  audio,
  video,
  cast,
  streams,
  currentUserId,
  chat,
}) => {
  const mq = useMediaQuery();

  return (
    <div
      id="session"
      // 157px is the height of the rest of the content outside the session on mobile
      // 176px is the height of the rest of the content outside the session on tablet and desktop
      className={cn(
        "flex relative flex-col gap-4 lg:gap-6 lg:h-[calc(100vh-176px)] lg:min-h-[800px]",
        chat.enabled
          ? "h-full"
          : "h-[calc(100vh-157px)] md:h-[calc(100vh-176px)]"
      )}
    >
      <div
        className={cn(
          "w-full grow lg:grow-0",
          chat.enabled ? "relative lg:flex lg:flex-row lg:gap-6" : "flex"
        )}
      >
        <SessionStreams
          currentUserId={currentUserId}
          streams={streams}
          chat={chat.enabled}
        />

        <div
          key="chat"
          className={cn(
            "h-full shadow shadow-message-panel rounded-2xl overflow-hidden lg:h-[550px] w-[344px] flex-shrink-0",
            chat.enabled && mq.lg ? "visible" : "hidden"
          )}
        >
          {chatPanel}
        </div>
      </div>

      <Actions
        leave={leave}
        screen={cast}
        video={video}
        audio={audio}
        chat={chat}
      />

      <div
        className={cn(
          "absolute w-full h-full top-0 left-0 z-stream-chat",
          chat.enabled && !mq.lg ? "visible" : "hidden"
        )}
      >
        {chatPanel}
      </div>
    </div>
  );
};

export default Session;
