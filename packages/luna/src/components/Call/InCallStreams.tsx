import React from "react";
import cn from "classnames";
import { FocusedStream, UnFocusedStream } from "@/components/Call";
import { StreamInfo } from "@/components/Call/types";
import { Void } from "@litespace/types";

export const InCallStreams: React.FC<{
  internetProblem?: boolean;
  streams: {
    focused: StreamInfo;
    unfocused: StreamInfo[];
  };
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
}> = ({ internetProblem, streams, chat, timer, fullScreen }) => {
  return (
    <div
      className={cn(
        "tw-relative tw-w-full tw-rounded-lg tw-h-full tw-bg-brand-100 tw-grid tw-gap-6",
        chat && "tw-p-6 tw-rounded-none tw-rounded-tr-lg tw-rounded-br-lg "
      )}
    >
      <FocusedStream
        fullScreen={fullScreen}
        stream={streams.focused}
        timer={timer}
        internetProblem={internetProblem}
      />
      <div
        className={cn(
          "tw-flex tw-items-center tw-gap-6",
          !chat && "tw-absolute tw-bottom-6 tw-right-6"
        )}
      >
        {streams.unfocused.map((stream, index) => (
          <UnFocusedStream key={index} stream={stream} />
        ))}
      </div>
    </div>
  );
};
