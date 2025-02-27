import { range } from "lodash";
import React from "react";
import { motion } from "framer-motion";

export const AudioController: React.FC<{
  setVolume: (volume: number) => void;
  volume: number;
}> = ({ setVolume, volume }) => {
  return (
    <div className="flex gap-[2px] items-end h-[12px]" dir="ltr">
      {range(0, 5).map((_, index) => (
        <motion.button
          whileHover={{ scale: 1.2, transformOrigin: "bottom" }}
          type="button"
          onClick={() => setVolume((index + 1) / 5)}
          key={index}
          className="h-full flex items-end"
        >
          <div
            data-active={(index + 1) / 5 <= volume}
            style={{
              height: `${((index + 1) / 5) * 100}%`,
            }}
            className="w-[3px] shrink-0 bg-natural-50 data-[active=true]:bg-brand-500"
          />
        </motion.button>
      ))}
    </div>
  );
};
