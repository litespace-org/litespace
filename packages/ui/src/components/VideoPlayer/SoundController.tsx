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
        "flex items-center flex-row-reverse gap-1 @lg:gap2 @lg:px-2 group focus:outline-none",
        "focus:ring-background-control rounded-md focus:ring-1 focus-visible:border-foreground-muted focus-visible:ring-background-control"
      )}
    >
      <button
        className={cn(
          "focus:outline-none flex items-center justify-center p-1",
          "focus:ring-background-control rounded-md focus:ring-1 focus-visible:border-foreground-muted focus-visible:ring-background-control"
        )}
        onClick={toggle}
      >
        <Icon className="w-4 h-4 @lg:w-5 @lg:h-5" />
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
