import React from "react";
import Play from "@litespace/assets/Play";
import { Void } from "@litespace/types";

export const PlayButton: React.FC<{ togglePlay: Void }> = ({ togglePlay }) => {
  return (
    <button
      onClick={togglePlay}
      className="tw-w-[26px] tw-h-[27px] md:tw-w-[96px] tw-rounded-full tw-overflow-hidden tw-relative md:tw-h-[96px]  tw-flex tw-items-center tw-justify-center"
    >
      <div className="tw-w-[13.56px] tw-h-[15.52px] md:tw-w-[32px] md:tw-h-[36px]">
        <Play />
      </div>
      <div className="tw-absolute tw-w-full tw-shadow-play-button tw-h-full tw-rounded-full tw-bg-background-button-play tw-blur-[20px]"></div>
    </button>
  );
};
