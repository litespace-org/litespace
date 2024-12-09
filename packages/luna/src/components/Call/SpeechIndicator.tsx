import React from "react";
import cn from "classnames";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Sound from "@litespace/assets/Sound";
export const SpeechIndicator: React.FC<{
  speaking: boolean;
  mic: boolean;
}> = ({ speaking, mic }) => {
  return (
    <div
      className={cn(
        "tw-rounded-full tw-w-16 tw-h-16 tw-backdrop-blur-[15px] tw-p-4",
        {
          "tw-bg-background-indicator": !speaking || !mic,
          "tw-bg-background-speaking": speaking,
        }
      )}
    >
      {mic ? (
        <Sound className="[&>*]:tw-stroke-natural-50" />
      ) : (
        <MicrophoneSlash className="[&>*]:tw-stroke-natural-50" />
      )}
    </div>
  );
};

export default SpeechIndicator;
