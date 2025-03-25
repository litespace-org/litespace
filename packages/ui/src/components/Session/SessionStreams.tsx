import React, { useMemo } from "react";
import { Stream } from "@/components/Session/Stream";
import { StreamInfo } from "@/components/Session/types";
import { organizeStreams } from "@/lib/stream";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { isEmpty } from "lodash";
import cn from "classnames";

export const SessionStreams: React.FC<{
  currentUserId: number;
  streams: StreamInfo[];
  /**
   * Whether the chat panel is enabled or not.
   * @default false
   */
  chat?: boolean;
}> = ({ streams, chat, currentUserId }) => {
  const mq = useMediaQuery();
  const organizedStreams = useMemo(
    () => organizeStreams(streams, currentUserId, !!chat && !mq.lg),
    [streams, currentUserId, chat, mq.lg]
  );

  return (
    <div
      id="session-streams"
      className="flex flex-col gap-4 lg:gap-6 w-full h-full"
      data-info={chat ? "with-chat" : "without-chat"}
    >
      {organizedStreams.focused ? (
        <div className={cn("w-full relative rounded-2xl overflow-hidden grow")}>
          <Stream
            muted={
              (currentUserId === organizedStreams.focused.user.id &&
                !organizedStreams.focused.cast) ||
              !organizedStreams.focused.audio
            }
            stream={organizedStreams.focused}
            mirror={
              currentUserId === organizedStreams.focused.user.id &&
              !organizedStreams.focused.cast
            }
          />
        </div>
      ) : null}

      {!isEmpty(organizedStreams.unfocused) ? (
        <div className="grid w-full grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-6">
          {organizedStreams.unfocused.map(
            (item, idx) =>
              item && (
                <div
                  key={idx}
                  className="border border-natural-200 lg:h-[123px] lg:w-[219px] w-full relative rounded-lg overflow-hidden"
                >
                  <Stream
                    size="small"
                    stream={item}
                    muted={currentUserId === item.user.id && !item.cast}
                    mirror={currentUserId === item.user.id && !item.cast}
                  />
                </div>
              )
          )}
        </div>
      ) : null}
    </div>
  );
};
