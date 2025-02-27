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
      return <MicrophoneSlashSmall className="[&>*]:stroke-natural-50" />;
    if (muted && variant === "large")
      return <MicrophoneSlash className="[&>*]:stroke-natural-50" />;
    if (!muted && variant === "small")
      return <SoundSmall className="[&>*]:stroke-natural-50 hekki" />;
    return <Sound className="[&>*]:stroke-natural-50" />;
  }, [muted, variant]);

  return (
    <div
      className={cn(
        "rounded-full backdrop-blur-[15px] flex items-center justify-center",
        {
          "bg-background-indicator": !speaking || muted,
          "bg-background-speaking": speaking && !muted,
          "w-16 h-16": variant === "large",
          "w-8 h-8": variant === "small",
        }
      )}
    >
      {icon}
    </div>
  );
};

export default SpeechIndicator;
