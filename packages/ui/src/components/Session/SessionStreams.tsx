import React, { useMemo } from "react";
import cn from "classnames";
import { FocusedStream } from "@/components/Session/FocusedStream";
import { UnFocusedStream } from "@/components/Session/UnFocusedStream";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import { MovableMedia } from "@/components/MovableMedia";
import { organizeStreams } from "@/lib/stream";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export const SessionStreams: React.FC<{
  alert?: string;
  currentUserId: number;
  streams: StreamInfo[];
  containerRef: React.RefObject<HTMLDivElement>;
  /**
   * Whether the chat panel is enabled or not.
   * @default false
   */
  chat?: boolean;
  timer: {
    duration: number;
    startAt: string;
  };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
}> = ({
  alert,
  streams,
  chat,
  timer,
  fullScreen,
  currentUserId,
  containerRef,
}) => {
  const mq = useMediaQuery();
  const organizedStreams = useMemo(
    () => organizeStreams(streams, currentUserId, !!chat && !mq.lg),
    [streams, currentUserId, chat, mq.lg]
  );

  return (
    <div
      id="session-streams"
      data-info={chat ? "with-chat" : "without-chat"}
      ref={containerRef}
      className={cn({
        "tw-rounded-none tw-rounded-tr-lg tw-rounded-br-lg md:tw-w-full md:tw-h-full tw-flex tw-flex-col tw-absolute md:tw-relative":
          chat,
        "tw-relative tw-rounded-lg tw-w-full tw-h-full": !chat,
      })}
    >
      {organizedStreams.focused ? (
        <FocusedStream
          muted={organizedStreams.focused.user.id === currentUserId}
          stream={organizedStreams.focused}
          fullScreen={fullScreen}
          timer={timer}
          alert={alert}
          chat={chat}
        />
      ) : null}

      <MovableMedia
        container={containerRef}
        className={cn(
          "tw-flex tw-items-center tw-gap-4 lg:tw-p-0 tw-absolute tw-top-10 lg:tw-top-0 lg:tw-static tw-z-floating-streams tw-h-fit tw-w-fit",
          !chat && "lg:tw-absolute tw-bottom-6 tw-right-6"
        )}
      >
        {organizedStreams.unfocused.map((stream, idx) => {
          if (!stream) return null;
          return (
            <UnFocusedStream
              key={idx}
              muted={stream.user.id === currentUserId}
              stream={stream}
            />
          );
        })}
      </MovableMedia>
    </div>
  );
};
