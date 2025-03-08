import React, { useMemo } from "react";
import { Stream } from "@/components/Session/Stream";
import { StreamInfo } from "@/components/Session/types";
import { organizeStreams } from "@/lib/stream";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { isEmpty } from "lodash";

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
      className="flex flex-col gap-4 lg:gap-6 h-full"
      data-info={chat ? "with-chat" : "without-chat"}
    >
      {organizedStreams.focused ? (
        <div className="w-full h-full lg:min-h-[553px] relative rounded-2xl overflow-hidden">
          <Stream
            muted={
              currentUserId === organizedStreams.focused.user.id ||
              organizedStreams.focused.audio
            }
            stream={organizedStreams.focused}
          />
        </div>
      ) : null}

      {!isEmpty(organizedStreams.unfocused) ? (
        <div className="grid w-full !h-[153px] grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-6">
          {organizedStreams.unfocused.map(
            (ele, idx) =>
              ele && (
                <div
                  key={idx}
                  className="lg:w-[219px] border border-natural-200 lg:h-[123px] w-full h-[109px] md:h-[153px] relative rounded-lg overflow-hidden"
                >
                  <Stream size="small" muted={ele?.audio} stream={ele} />
                </div>
              )
          )}
        </div>
      ) : null}
    </div>
  );
};
