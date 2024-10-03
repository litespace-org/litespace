import React, { useEffect, useRef } from "react";
import cn from "classnames";
import { useFormatMessage } from "@litespace/luna";

const UserMedia: React.FC<{
  stream: MediaStream;
  muted?: boolean;
  mode?: "cover" | "contain";
  name?: string;
  screen?: boolean;
}> = ({ stream, muted = false, name, mode = "cover", screen = false }) => {
  const intl = useFormatMessage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden bg-surface-100 border border-border-strong">
      <video
        autoPlay
        playsInline
        muted={muted}
        ref={videoRef}
        className={cn("w-full h-full", {
          "object-contain": mode === "contain",
          "object-cover": mode === "cover",
        })}
      />

      {name ? (
        <p className="absolute bottom-1 right-2 text-white shadow-lg text-sm md:text-base">
          {screen ? intl("global.labels.screen.of", { name }) : name}
        </p>
      ) : null}
    </div>
  );
};

export default UserMedia;
