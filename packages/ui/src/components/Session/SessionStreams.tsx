import React, { useMemo, useRef } from "react";
import cn from "classnames";
import { FocusedStream } from "@/components/Session/FocusedStream";
import { UnFocusedStream } from "@/components/Session/UnFocusedStream";
import { StreamInfo } from "@/components/Session/types";
import { Void } from "@litespace/types";
import { MovableMedia } from "@/components/MovableMedia";
import { organizeStreams } from "@/lib/stream";

export const SessionStreams: React.FC<{
  alert?: string;
  currentUserId: number;
  streams: StreamInfo[];
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
}> = ({ alert, streams, chat, timer, fullScreen, currentUserId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const organizedStreams = useMemo(
    () => organizeStreams(streams, currentUserId),
    [streams, currentUserId]
  );

  // SHOULD NEVER HAPPEN
  if (!organizedStreams.focused) return null;

  return (
    <div
      data-name="session-streams"
      ref={containerRef}
      className={cn("tw-relative", {
        "tw-rounded-none tw-rounded-tr-lg tw-rounded-br-lg tw-w-full tw-h-full tw-flex tw-flex-col":
          chat,
        "tw-rounded-lg tw-w-full tw-h-full": !chat,
      })}
    >
      <FocusedStream
        muted={organizedStreams.focused.user.id === currentUserId}
        stream={organizedStreams.focused}
        fullScreen={fullScreen}
        timer={timer}
        alert={alert}
        chat={chat}
      />

      <div
        className={cn(
          "tw-flex tw-items-center tw-gap-6",
          !chat && "tw-absolute tw-bottom-6 tw-right-6"
        )}
      >
        {organizedStreams.unfocused.map((stream, idx) => {
          if (!stream) return null;
          return (
            <MovableMedia container={containerRef} key={idx}>
              <UnFocusedStream
                muted={stream.user.id === currentUserId}
                stream={stream}
              />
            </MovableMedia>
          );
        })}
      </div>
    </div>
  );
};
