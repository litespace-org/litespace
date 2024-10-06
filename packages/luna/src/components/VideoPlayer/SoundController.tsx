import React, { useMemo } from "react";
import { Slider } from "@/components/Slider";
import { Volume, Volume1, Volume2, VolumeX } from "react-feather";
import cn from "classnames";

const SoundController: React.FC<{
  toggle: () => void;
  setVolume: (volume: number) => void;
  muted: boolean;
  volume: number;
}> = ({ toggle, setVolume, muted, volume }) => {
  const Icon = useMemo(() => {
    if (muted) return VolumeX;
    if (volume <= 0.2) return Volume;
    if (volume <= 0.5) return Volume1;
    return Volume2;
  }, [muted, volume]);

  const volumeValue = useMemo(() => {
    if (volume <= 0.01) return volume;
    if (muted) return 0;
    return volume;
  }, [muted, volume]);

  return (
    <div
      tabIndex={0}
      className={cn(
        "tw-flex tw-items-center tw-flex-row-reverse tw-gap-2 tw-px-2 tw-group focus:tw-outline-none",
        "focus:tw-ring-background-control tw-rounded-md focus:tw-ring-1 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control"
      )}
    >
      <button
        className={cn(
          "focus:tw-outline-none tw-flex tw-items-center tw-justify-center tw-p-1",
          "focus:tw-ring-background-control tw-rounded-md focus:tw-ring-1 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control"
        )}
        onClick={toggle}
      >
        <Icon />
      </button>

      <Slider
        min={0}
        max={1}
        step={0.01}
        value={volumeValue}
        onValueChange={setVolume}
      />
    </div>
  );
};

export default SoundController;
