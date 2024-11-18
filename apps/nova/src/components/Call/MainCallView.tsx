import React, { useEffect, useRef } from "react";
import Maximize from "@litespace/assets/Maximize";
import Recording from "@litespace/assets/Recording";
import cn from "classnames";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";

const MainCallView: React.FC<{
  stream: MediaStream;
  muted?: boolean;
  title?: string;
  fullScreen: {
    start: Void;
    exit: Void;
    enabled: boolean;
  };
}> = ({ stream, muted, title, fullScreen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="h-full flex items-center justify-center">
      <div
        className={cn(
          "relative ",
          fullScreen.enabled ? "h-full max-h-[calc(100vh-7rem)] mt-3" : "w-full"
        )}
      >
        <button
          className={cn(
            "absolute top-6 right-6 z-10 bg-[rgba(0,0,0,0.3)] backdrop-blur p-3 rounded-full"
          )}
          onClick={fullScreen.enabled ? fullScreen.exit : fullScreen.start}
        >
          <Maximize className="[&_*]:stroke-natural-50" />
        </button>

        {title ? (
          <Typography
            element="subtitle-2"
            className={cn(
              "text-natural-50",
              "bg-[rgba(0,0,0,0.3)] backdrop-blur py-2 rounded-full px-7",
              "absolute bottom-6 left-6 z-10"
            )}
          >
            {title}
          </Typography>
        ) : null}

        <div
          dir="ltr"
          className={cn(
            "backdrop-blur bg-[rgba(0,0,0,0.3)] px-2 py-2 pr-9 rounded-full",
            "absolute top-6 left-6 z-10",
            "flex flex-row gap-2 items-center justify-center"
          )}
        >
          <Recording />

          <Typography element="subtitle-2" className="text-natural-50">
            24:01:45
          </Typography>
        </div>

        <video
          autoPlay
          playsInline
          muted={muted}
          ref={videoRef}
          className={cn("rounded-lg", fullScreen.enabled ? "h-full" : "w-full")}
        />
      </div>
    </div>
  );
};

export default MainCallView;
