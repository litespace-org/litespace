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
  mic: boolean;
  timer: {
    duration: number;
    startAt: string;
  };
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
}> = ({ alert, streams, chat, timer, fullScreen, currentUserId, mic }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const newStreams = useMemo(
    () => organizeStreams(streams, currentUserId),
    [streams, currentUserId]
  );

  // SHOULD NEVER HAPPEN
  if (!newStreams.focused) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "tw-relative tw-w-full tw-h-full tw-bg-brand-100 tw-gap-6 tw-overflow-hidden",
        {
          "tw-p-6 tw-rounded-none tw-rounded-tr-lg tw-rounded-br-lg": chat,
          "tw-rounded-lg": !chat,
        }
      )}
    >
      <FocusedStream
        fullScreen={fullScreen}
        stream={newStreams.focused}
        timer={timer}
        muted={
          newStreams.focused.user.id === currentUserId
            ? !mic
            : newStreams.focused.muted
        }
        alert={alert}
      />

      <div
        className={cn(
          "tw-flex tw-items-center tw-gap-6",
          !chat && "tw-absolute tw-bottom-6 tw-right-6"
        )}
      >
        {newStreams.unfocused.map((stream, idx) => {
          if (!stream) return null;
          return (
            <MovableMedia container={containerRef} key={idx}>
              <UnFocusedStream
                owner={stream.user.id === currentUserId}
                mic={mic}
                stream={stream}
              />
            </MovableMedia>
          );
        })}
      </div>
    </div>
  );
};
