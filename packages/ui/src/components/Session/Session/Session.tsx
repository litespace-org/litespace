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
      className="tw-flex tw-flex-col tw-h-full tw-gap-4 lg:tw-gap-10 tw-pb-[66px]"
    >
      <div
        className={cn(
          "tw-w-full tw-aspect-video tw-grow tw-border tw-border-brand-700 tw-bg-brand-100",
          "tw-rounded-lg tw-overflow-hidden",
          chat.enabled
            ? "lg:tw-grid tw-relative lg:tw-grid-cols-[auto,minmax(35%,326px)]"
            : "tw-flex"
        )}
      >
        <AnimatePresence mode="wait">
          <AnimateWidth className="!tw-w-full">
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
            <AnimateWidth key="chat" className="tw-h-full">
              {chatPanel}
            </AnimateWidth>
          </AnimatePresence>
        ) : null}

        {chat.enabled && !mq.lg ? chatPanel : null}
      </div>
      <div className="tw-hidden lg:tw-block tw-border-t tw-border-natural-400" />
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
