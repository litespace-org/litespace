import React, { RefObject } from "react";
import cn from "classnames";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Typography } from "@litespace/ui/Typography";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";

const Preview: React.FC<{
  videoRef: RefObject<HTMLVideoElement>;
  userId: number;
  image: string | null;
  name: string | null;
  video: boolean;
  audio: boolean;
}> = ({ videoRef, userId, image, name, audio, video }) => {
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
          <AvatarV2 src={image} alt={name} id={userId} />
        </div>

        <Typography
          tag="p"
          className={cn(
            "text-natural-700 font-medium text-center text-subtitle-1",
            name ? "block" : "hidden"
          )}
        >
          {name}
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
