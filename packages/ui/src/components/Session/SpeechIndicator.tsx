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
        <MicrophoneSlashSmall className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4" />
      );
    if (muted && variant === "large")
      return (
        <MicrophoneSlash
          className={cn(
            "[&>*]:tw-stroke-natural-50",
            chat ? "tw-w-6 tw-h-6" : "tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8"
          )}
        />
      );
    if (!muted && variant === "small")
      return (
        <SoundSmall className="[&>*]:tw-stroke-natural-50 tw-w-4 tw-h-4" />
      );
    return (
      <Sound
        className={cn(
          "[&>*]:tw-stroke-natural-50",
          chat ? "tw-w-6 tw-h-6" : "tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8"
        )}
      />
    );
  }, [muted, variant, chat]);

  return (
    <div
      className={cn(
        "tw-rounded-full tw-backdrop-blur-[15px] tw-flex tw-items-center tw-justify-center",
        {
          "tw-bg-background-indicator": !speaking || muted,
          "tw-bg-background-speaking": speaking && !muted,
          "!tw-w-[42px] !tw-h-[42px] lg:!tw-h-16 lg:!tw-w-16":
            variant === "large",
          "tw-w-8 tw-h-8": variant === "small",
        }
      )}
    >
      {icon}
    </div>
  );
};

export default SpeechIndicator;
