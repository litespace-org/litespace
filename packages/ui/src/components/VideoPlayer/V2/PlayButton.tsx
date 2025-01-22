import React from "react";
import Play from "@litespace/assets/Play";
import TopLeftArch from "@litespace/assets/TopLeftArch";
import BottomRightArch from "@litespace/assets/BottomRightArch";
import { Void } from "@litespace/types";

export const PlayButton: React.FC<{ togglePlay: Void }> = ({ togglePlay }) => {
  return (
    <button
      onClick={togglePlay}
      className="tw-w-[26px] tw-h-[27px] md:tw-w-[77px] tw-rounded-lg tw-relative md:tw-h-[81px] tw-bg-brand-600 tw-flex tw-items-center tw-justify-center"
    >
      <div className="tw-absolute tw-top-1 tw-left-1 tw-w-[6.5px] tw-h-[5.7px] md:tw-w-[20px] md:tw-h-[18px]">
        <TopLeftArch />
      </div>
      <Play className="tw-scale-[200%]" />
      <BottomRightArch className="tw-absolute tw-bottom-1 tw-right-1" />
    </button>
  );
};
