import React, { useMemo, useState } from "react";
import { Slider } from "@/components/Slider";
import { Volume, Volume1, Volume2, VolumeX } from "react-feather";
import cn from "classnames";

const SoundController: React.FC<{
  toggle: () => void;
  setVolume: (volume: number) => void;
  muted: boolean;
  volume: number;
}> = ({ toggle, setVolume, muted, volume }) => {
  const [sliderFocused, setSliderFocused] = useState<boolean>(false);

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
        "flex items-center flex-row-reverse gap-4 px-2 group focus:outline-none",
        "focus:ring-background-control rounded-md focus:ring-2 focus-visible:border-foreground-muted focus-visible:ring-background-control"
      )}
    >
      <button
        className={cn(
          "focus:outline-none flex items-center justify-center p-1",
          "focus:ring-background-control rounded-md focus:ring-2 focus-visible:border-foreground-muted focus-visible:ring-background-control"
        )}
        onClick={toggle}
      >
        <Icon />
      </button>

      <div
        data-slider-focused={sliderFocused}
        className={cn(
          "w-0 overflow-hidden group-hover:w-[100px] group-focus:w-[100px] transition-[width] duration-300 ease-linear",
          "data-[slider-focused=true]:w-[100px]"
        )}
      >
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volumeValue}
          onChange={setVolume}
          onFocus={() => setSliderFocused(true)}
          onBlur={() => setSliderFocused(false)}
        />
      </div>
    </div>
  );
};

export default SoundController;
