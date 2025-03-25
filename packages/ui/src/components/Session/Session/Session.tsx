import { Void } from "@litespace/types";
import React from "react";
import { Actions } from "@/components/Session/Actions";
import { SessionStreams } from "@/components/Session/SessionStreams";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

type Props = {
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
      // 141 is the height of the rest of the content outside the session on mobile
      // 141 is the height of the rest of the content outside the session on tablet and desktop
      className="flex relative flex-col gap-4 lg:gap-6 h-[calc(100vh-141px)] md:h-[calc(100vh-152px)] lg:h-[calc(100vh-152px)] lg:min-h-[800px]"
    >
      <div
        className={cn(
          "w-full",
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
            "h-full shadow shadow-message-panel rounded-2xl overflow-hidden w-[344px] flex-shrink-0",
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
