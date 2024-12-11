import { range } from "lodash";
import React from "react";
import { motion } from "framer-motion";

export const AudioController: React.FC<{
  setVolume: (volume: number) => void;
  volume: number;
}> = ({ setVolume, volume }) => {
  return (
    <div className="tw-flex tw-gap-[2px] tw-items-end tw-h-[12px]" dir="ltr">
      {range(0, 5).map((_, index) => (
        <motion.button
          whileHover={{ scale: 1.2, transformOrigin: "bottom" }}
          type="button"
          onClick={() => setVolume((index + 1) / 5)}
          key={index}
          className="tw-h-full tw-flex tw-items-end"
        >
          <div
            data-active={(index + 1) / 5 <= volume}
            style={{
              height: `${((index + 1) / 5) * 100}%`,
            }}
            className="tw-w-[3px] tw-shrink-0 tw-bg-natural-50 data-[active=true]:tw-bg-brand-500"
          />
        </motion.button>
      ))}
    </div>
  );
};
