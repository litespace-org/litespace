import React, { useMemo } from "react";
import cn from "classnames";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import MicrophoneSlashSmall from "@litespace/assets/MicrophoneSlashSmall";
import Sound from "@litespace/assets/Sound";
import SoundSmall from "@litespace/assets/SoundSmall";

export const SpeechIndicator: React.FC<{
  speaking: boolean;
  mic: boolean;
  variant?: "Small" | "Large";
}> = ({ speaking, mic, variant = "Large" }) => {
  const Icon = useMemo(() => {
    if (!mic && variant === "Small")
      return <MicrophoneSlashSmall className="[&>*]:tw-stroke-natural-50" />;
    if (!mic && variant === "Large")
      return <MicrophoneSlash className="[&>*]:tw-stroke-natural-50" />;
    if (mic && variant === "Small")
      return <SoundSmall className="[&>*]:tw-stroke-natural-50 hekki" />;
    return <Sound className="[&>*]:tw-stroke-natural-50" />;
  }, [mic, variant]);

  return (
    <div
      className={cn(
        "tw-rounded-full tw-backdrop-blur-[15px] tw-flex tw-items-center tw-justify-center",
        {
          "tw-bg-background-indicator": !speaking || !mic,
          "tw-bg-background-speaking": speaking,
          "tw-w-16 tw-h-16": variant === "Large",
          "tw-w-8 tw-h-8": variant === "Small",
        }
      )}
    >
      {Icon}
    </div>
  );
};

export default SpeechIndicator;
