import { Void } from "@litespace/types";
import React, { useRef } from "react";
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
  const mq = useMediaQuery();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full gap-4 lg:gap-10 pb-[66px]"
    >
      <div
        className={cn(
          "w-full aspect-video grow border border-brand-700 bg-brand-100",
          "rounded-lg overflow-hidden",
          chat.enabled
            ? "lg:grid relative lg:grid-cols-[auto,minmax(35%,326px)]"
            : "flex"
        )}
      >
        <AnimatePresence mode="wait">
          <AnimateWidth className="!w-full">
            <SessionStreams
              containerRef={containerRef}
              currentUserId={currentUserId}
              fullScreen={fullScreen}
              streams={streams}
              chat={chat.enabled}
              timer={timer}
              alert={alert}
            />
          </AnimateWidth>
        </AnimatePresence>

        {chat.enabled && mq.lg ? (
          <AnimatePresence mode="wait">
            <AnimateWidth key="chat" className="h-full">
              {chatPanel}
            </AnimateWidth>
          </AnimatePresence>
        ) : null}

        {chat.enabled && !mq.lg ? chatPanel : null}
      </div>
      <div className="hidden lg:block border-t border-natural-400" />
      <Actions
        leave={leave}
        screen={cast}
        camera={camera}
        microphone={mic}
        chat={chat}
      />
    </div>
  );
};

export default Session;
