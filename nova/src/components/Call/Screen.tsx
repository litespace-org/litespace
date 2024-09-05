import React, { useMemo } from "react";
import cn from "classnames";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import { first } from "lodash";

const Screen: React.FC<{
  screenStream: MediaStream;
  otherStreams: Array<MediaStream | null>;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ screenStream, otherStreams, containerRef }) => {
  const activeStreams = useMemo(
    () => otherStreams.filter((stream) => stream !== null),
    [otherStreams]
  );
  const one = useMemo(() => activeStreams.length === 1, [activeStreams.length]);
  const many = useMemo(() => activeStreams.length >= 2, [activeStreams.length]);

  return (
    <div className={cn("flex items-center justify-center flex-col gap-2")}>
      <div
        className={cn(
          "flex items-center justify-center w-full",
          one ? "h-full" : "h-[calc(100%-300px)]"
        )}
      >
        <UserMedia stream={screenStream} />
      </div>

      {one ? (
        <MovableMedia stream={first(activeStreams)!} container={containerRef} />
      ) : null}

      {many ? (
        <div className="flex flex-row justify-center gap-4 items-center h-[300px]">
          {activeStreams.map((stream) => (
            <UserMedia key={stream.id} stream={stream} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Screen;
