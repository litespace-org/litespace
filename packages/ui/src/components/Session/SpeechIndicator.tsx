import React, { useMemo } from "react";
import cn from "classnames";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import MicrophoneSlashSmall from "@litespace/assets/MicrophoneSlashSmall";
import Sound from "@litespace/assets/Sound";
import SoundSmall from "@litespace/assets/SoundSmall";

export const SpeechIndicator: React.FC<{
  speaking: boolean;
  muted: boolean;
  variant?: "small" | "large";
  chat?: boolean;
}> = ({ speaking, muted, variant = "large", chat }) => {
  const icon = useMemo(() => {
    if (muted && variant === "small")
      return (
        <MicrophoneSlashSmall className="[&>*]:stroke-natural-50 w-4 h-4" />
      );
    if (muted && variant === "large")
      return (
        <MicrophoneSlash
          className={cn(
            "[&>*]:stroke-natural-50",
            chat ? "w-6 h-6" : "w-4 h-4 lg:h-8 lg:w-8"
          )}
        />
      );
    if (!muted && variant === "small")
      return <SoundSmall className="[&>*]:stroke-natural-50 w-4 h-4" />;
    return (
      <Sound
        className={cn(
          "[&>*]:stroke-natural-50",
          chat ? "w-6 h-6" : "w-4 h-4 lg:h-8 lg:w-8"
        )}
      />
    );
  }, [muted, variant, chat]);

  return (
    <div
      className={cn(
        "rounded-full backdrop-blur-[15px] flex items-center justify-center",
        {
          "bg-background-indicator": !speaking || muted,
          "bg-background-speaking": speaking && !muted,
          "!w-[42px] !h-[42px] lg:!h-16 lg:!w-16": variant === "large",
          "w-8 h-8": variant === "small",
        }
      )}
    >
      {icon}
    </div>
  );
};

export default SpeechIndicator;
