import React from "react";
import Play from "@litespace/assets/Play";
import TopLeftArch from "@litespace/assets/TopLeftArch";
import BottomRightArch from "@litespace/assets/BottomRightArch";
import { Void } from "@litespace/types";

export const PlayButton: React.FC<{ togglePlay: Void }> = ({ togglePlay }) => {
  return (
    <button
      onClick={togglePlay}
      className="tw-w-[77px] tw-rounded-lg tw-relative tw-h-[81px] tw-bg-brand-600 tw-flex tw-items-center tw-justify-center"
    >
      <TopLeftArch className="tw-absolute tw-top-1 tw-left-1" />
      <Play className="tw-scale-[200%]" />
      <BottomRightArch className="tw-absolute tw-bottom-1 tw-right-1" />
    </button>
  );
};
