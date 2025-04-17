import React, { useEffect, useRef, useState } from "react";
import cn from "classnames";
import { Avatar } from "@litespace/ui/Avatar";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Lottie from "react-lottie";
import audioWave from "@/components/Session/audioWave.json";
import { Typography } from "@litespace/ui/Typography";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import Spinner from "@litespace/assets/Spinner";

const Stream: React.FC<{
  stream: MediaStream | null;
  muted?: boolean;
  video?: boolean;
  audio?: boolean;
  speaking?: boolean;
  size?: "sm" | "md" | "lg";
  userId: number;
  userImage: string | null;
  userName: string | null;
  loading?: boolean;
}> = ({
  stream,
  muted,
  video,
  audio,
  speaking,
  userId,
  userImage,
  userName,
  loading,
  size = "md",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dirty, setDirty] = useState(false);
  const [fillHorizontally, setFillHorizontally] = useState(true);
  const mq = useMediaQuery();

  useEffect(() => {
    if (dirty) return;
    if (mq.lg) setFillHorizontally(false);
  }, [dirty, mq.lg]);

  useEffect(() => {
    // Attach the media stream to the video element to start playing it.
    // Note: video element can play both audio and video tracks.
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div
      id="stream"
      className={cn(
        "relative flex items-center justify-center bg-natural-100 rounded-2xl",
        "w-full h-full max-h-full overflow-hidden",
        speaking && "ring-4 ring-secondary-400"
      )}
    >
      <div
        id="loading"
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-stream-v2-spinner",
          "bg-natural-50 p-1 rounded-full",
          loading ? "visible" : "invisible"
        )}
      >
        <Spinner className="w-8 h-8 fill-natural-700" />
      </div>

      <div
        className={cn(
          "absolute z-stream-v2-mute-icon",
          "flex items-center justify-center bg-[#0000004D] backdrop-blur-[7.5px]",
          "rounded-full",
          !audio ? "visible" : "invisible",
          {
            "top-4 left-4 w-8 h-8": size === "md" || size === "lg",
            "top-2 left-2 w-6 h-6": size === "sm",
          }
        )}
      >
        <MicrophoneSlash className="w-4 h-4 [&_*]:stroke-natural-50" />
      </div>

      <div
        className={cn(
          "absolute top-4 left-4 z-stream-v2-speaking w-8 h-8",
          speaking && audio ? "visible" : "invisible"
        )}
      >
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: audioWave, // TODO: get the latest file from Ziad.
          }}
        />
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
        <div
          className={cn("rounded-full overflow-hidden", {
            "w-60 h-60": size == "lg",
            "w-24 h-24": size == "md",
            "w-16 h-16": size == "sm",
          })}
        >
          <Avatar src={userImage} alt={userName} seed={userId} />
        </div>

        {userName ? (
          <Typography
            tag="p"
            className={cn("text-natural-700 font-medium text-center", {
              "text-subtitle-1 ": size === "md" || size === "lg",
              "text-caption": size === "sm",
            })}
          >
            {userName}
          </Typography>
        ) : null}
      </div>

      <video
        onClick={() => {
          setFillHorizontally(!fillHorizontally);
          setDirty(true);
        }}
        ref={videoRef}
        autoPlay
        /**
         * Current user should never hear his sound (else it will feel off)
         */
        muted={muted}
        // Ref: https://css-tricks.com/what-does-playsinline-mean-in-web-video/
        playsInline
        /**
         * Ref: https://webrtchacks.com/mirror-framerate/
         *
         * When the media stream is rendered, user is expecting to see himself
         * mirrored (as if he is looking into a mirror). To achieve this, we
         * need to flip the media stream using css.
         *
         * TIP: Disable the `transform` to notice the difference.
         */
        style={{ transform: "scale(-1,1)" }}
        className={
          /**
           * A video must be positioned absolute as it will overflow from its
           * parent if we do otherwise.
           */
          cn("absolute", "cursor-pointer", {
            /**
             * When the user disables the camera, the video element will be black.
             * In this case, we should mark it as "hidden/invisible" not to
             * interfer with the styling.
             *
             * TIP: Disable the line below to notice the difference.
             */
            invisible: !video,
            /**
             * @note `w-full` vs `h-full`
             * - `w-full` (default): The video element will take the full width of
             *   the card, potentially cropping the video vertically.
             * - `h-full`: The video element will take the full height of the card,
             *   potentially cropping the video horizontally.
             */
            "h-full": !fillHorizontally,
            "w-full": fillHorizontally,
          })
        }
      />

      <div // Ref: https://css-tricks.com/design-considerations-text-images/
        id="user-name"
        className={cn(
          userName && video ? "visible" : "invisible",
          "absolute z-stream-v2-user-name",
          "bg-natural-50 rounded-full px-2",
          {
            "bottom-4 right-4": size === "lg",
            "bottom-3 right-3": size === "md",
            "bottom-2 right-2": size === "sm",
          }
        )}
      >
        <Typography tag="p" className="text-tiny text-natural-700 font-medium">
          {userName}
        </Typography>
      </div>
    </div>
  );
};

export default Stream;
