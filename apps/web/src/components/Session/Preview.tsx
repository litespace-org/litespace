import React, { useEffect, useRef } from "react";
import cn from "classnames";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import { VideoTrack } from "@/modules/MediaCall/types";
import { useUser } from "@litespace/headless/context/user";

const Preview: React.FC<{
  videoTrack?: VideoTrack;
  video: boolean;
  audio: boolean;
}> = ({ videoTrack, audio, video }) => {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoTrack)
      videoRef.current.srcObject = new MediaStream([videoTrack]);
  }, [videoTrack]);

  return (
    <div className="relative w-full h-full rounded-2xl bg-natural-100 overflow-hidden">
      <div
        className={cn(
          "absolute z-stream-v2-mute-icon",
          "flex items-center justify-center bg-[#0000004D] backdrop-blur-[7.5px]",
          "rounded-full top-4 left-4 w-8 h-8",
          !audio ? "visible" : "invisible"
        )}
      >
        <MicrophoneSlash className="w-4 h-4 [&_*]:stroke-natural-50" />
      </div>

      <div
        id="avatar-overlay"
        className={cn(
          // postion the overlay on top the entire stream.
          "absolute z-stream-v2-avatar top-0 left-0 w-full h-full",
          // control children layout.
          "flex items-center justify-center",
          // coloring (same color as #stream).
          "bg-natural-100",
          // layout
          "flex flex-col gap-2",
          !video ? "visible" : "invisible"
        )}
      >
        <div className={cn("rounded-full overflow-hidden w-24 h-24")}>
          <AvatarV2 id={user?.id} src={user?.image} alt={user?.name} />
        </div>

        <Typography
          tag="p"
          className={cn(
            "text-natural-700 font-medium text-center text-subtitle-1",
            user?.name ? "block" : "hidden"
          )}
        >
          {user?.name}
        </Typography>
      </div>

      <video
        muted
        autoPlay
        playsInline
        ref={videoRef}
        style={{ transform: "scale(-1,1)" }}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default Preview;
