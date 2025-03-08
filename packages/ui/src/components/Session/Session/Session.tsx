import { Void } from "@litespace/types";
import React from "react";
import { Actions } from "@/components/Session/Actions";
import { SessionStreams } from "@/components/Session/SessionStreams";
import { StreamInfo } from "@/components/Session/types";
import cn from "classnames";
import { AnimatePresence } from "framer-motion";
import { AnimateWidth } from "@/components/Animate";
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
  cast: {
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
    <div className="flex relative flex-col h-full gap-4 lg:gap-6 pb-[78px]">
      <div
        className={cn(
          "w-full grow",
          chat.enabled
            ? "lg:grid relative gap-6 lg:grid-cols-[auto,minmax(35%,326px)]"
            : "flex"
        )}
      >
        <AnimatePresence mode="wait">
          <AnimateWidth className="!w-full h-full">
            <SessionStreams
              currentUserId={currentUserId}
              streams={streams}
              chat={chat.enabled}
            />
          </AnimateWidth>
        </AnimatePresence>

        {chat.enabled && mq.lg ? (
          <AnimatePresence mode="wait">
            <AnimateWidth
              key="chat"
              className="h-full shadow shadow-message-panel rounded-2xl"
            >
              {chatPanel}
            </AnimateWidth>
          </AnimatePresence>
        ) : null}
      </div>
      <Actions
        leave={leave}
        screen={cast}
        video={video}
        audio={audio}
        chat={chat}
      />
      {chat.enabled && !mq.lg ? (
        <div className="absolute w-full h-full top-0 left-0 z-stream-chat">
          {chatPanel}
        </div>
      ) : null}
    </div>
  );
};

export default Session;
