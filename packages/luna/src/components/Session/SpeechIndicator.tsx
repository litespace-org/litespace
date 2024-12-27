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
}> = ({ speaking, muted, variant = "large" }) => {
  const icon = useMemo(() => {
    if (muted && variant === "small")
      return <MicrophoneSlashSmall className="[&>*]:tw-stroke-natural-50" />;
    if (muted && variant === "large")
      return <MicrophoneSlash className="[&>*]:tw-stroke-natural-50" />;
    if (!muted && variant === "small")
      return <SoundSmall className="[&>*]:tw-stroke-natural-50 hekki" />;
    return <Sound className="[&>*]:tw-stroke-natural-50" />;
  }, [muted, variant]);

  return (
    <div
      className={cn(
        "tw-rounded-full tw-backdrop-blur-[15px] tw-flex tw-items-center tw-justify-center",
        {
          "tw-bg-background-indicator": !speaking || muted,
          "tw-bg-background-speaking": speaking,
          "tw-w-16 tw-h-16": variant === "large",
          "tw-w-8 tw-h-8": variant === "small",
        }
      )}
    >
      {icon}
    </div>
  );
};

export default SpeechIndicator;
