import React from "react";
import { Void } from "@litespace/types";
import FocusedStream from "./FocusedStream";
import UnFocusedStream from "./UnFocusedStream";
import cn from "classnames";

export const InCallStreams: React.FC<{
  internetProblem?: boolean;
  streams: {
    fullScreen: {
      enabled: boolean;
      toggle: Void;
    };
    speech: {
      speaking: boolean;
      mic: boolean;
    };
    camera: boolean;
    cast: boolean;
    stream: MediaStream | null;
    user: {
      id: number;
      imageUrl: string | null;
      name: string | null;
    };
    type: "focused" | "unfocused";
  }[];
  chat?: boolean;
  timer: {
    duration: number;
    startAt: string;
  };
}> = ({ internetProblem, streams, chat, timer }) => {
  const sortedStreams = streams.sort((a, b) => a.type.localeCompare(b.type));
  const focusedStream = streams.slice(0, 1)[0];
  return (
    <div
      className={cn(
        "tw-relative tw-w-full tw-rounded-lg tw-h-full tw-bg-brand-100 tw-grid tw-gap-6",
        chat && "tw-p-6"
      )}
    >
      <FocusedStream stream={focusedStream} timer={timer} />
      <div
        className={cn(
          "tw-flex tw-items-center tw-gap-6",
          !chat && "tw-absolute tw-bottom-6 tw-right-6"
        )}
      >
        {sortedStreams
          .filter((stream) => stream.type === "unfocused")
          .map((stream, index) => (
            <UnFocusedStream
              key={index}
              stream={stream}
              internetProblem={internetProblem}
            />
          ))}
      </div>
    </div>
  );
};
