import React, { useMemo } from "react";
import cn from "classnames";
import { FocusedStream } from "@/components/Session/FocusedStream";
import { UnFocusedStream } from "@/components/Session/UnFocusedStream";
import { StreamInfo } from "@/components/Session/types";
import { MovableMedia } from "@/components/MovableMedia";
import { organizeStreams } from "@/lib/stream";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export const SessionStreams: React.FC<{
  currentUserId: number;
  streams: StreamInfo[];
  containerRef: React.RefObject<HTMLDivElement>;
  /**
   * Whether the chat panel is enabled or not.
   * @default false
   */
  chat?: boolean;
}> = ({ streams, chat, currentUserId, containerRef }) => {
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
        "rounded-none rounded-tr-lg rounded-br-lg md:w-full md:h-full flex flex-col absolute md:relative":
          chat,
        "relative rounded-lg w-full h-full": !chat,
      })}
    >
      {organizedStreams.focused ? (
        <FocusedStream
          muted={organizedStreams.focused.user.id === currentUserId}
          stream={organizedStreams.focused}
          chat={chat}
        />
      ) : null}

      <MovableMedia
        container={containerRef}
        className={cn(
          "flex items-center gap-4 lg:p-0 absolute top-10 lg:top-0 lg:static z-floating-streams h-fit w-fit",
          !chat && "lg:absolute bottom-6 right-6"
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
