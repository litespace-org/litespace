import React, { useMemo } from "react";
import cn from "classnames";
import MovableMedia from "@/components/Call/MovableMedia";
import UserMedia from "@/components/Call/UserMedia";
import { first } from "lodash";

const Screen: React.FC<{
  screen: { stream: MediaStream; name?: string };
  others: Array<{ stream: MediaStream | null; name?: string; screen: boolean }>;
  containerRef: React.RefObject<HTMLDivElement>;
  userName?: string;
  mateName?: string;
}> = ({ screen, others, containerRef }) => {
  const activeStreams = useMemo(
    () => others.filter(({ stream }) => stream !== null),
    [others]
  );
  const mate = useMemo(() => first(activeStreams), [activeStreams]);
  const one = useMemo(() => activeStreams.length === 1, [activeStreams.length]);
  const many = useMemo(() => activeStreams.length >= 2, [activeStreams.length]);

  return (
    <div
      className={cn("flex items-center h-full justify-center flex-col gap-4")}
    >
      <div
        className={cn(
          "flex items-center justify-center w-full",
          one ? "h-full" : "h-[calc(100%-300px)]"
        )}
      >
        <UserMedia
          stream={screen.stream}
          mode="contain"
          name={screen.name}
          screen
        />
      </div>

      {one && mate && mate?.stream ? (
        <MovableMedia stream={mate.stream} container={containerRef} muted />
      ) : null}

      {many ? (
        <div className="flex flex-row justify-center gap-4 items-center lg:h-[300px] w-full">
          {activeStreams.map(({ stream, name, screen }) => {
            if (!stream) return null;
            return (
              <UserMedia
                key={stream.id}
                stream={stream}
                mode="cover"
                name={name}
                screen={screen}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default Screen;
