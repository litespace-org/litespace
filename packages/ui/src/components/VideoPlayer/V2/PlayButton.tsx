import React from "react";
import Play from "@litespace/assets/Play";
import { Void } from "@litespace/types";
import cn from "classnames";

export const PlayButton: React.FC<{ togglePlay: Void }> = ({ togglePlay }) => {
  return (
    <button
      onClick={togglePlay}
      className={cn(
        "tw-relative tw-w-[96px] tw-h-[96px] tw-rounded-full tw-backdrop-blur-[20px]",
        "tw-overflow-hidden tw-relative tw-flex tw-items-center tw-justify-center",
        "tw-ring-1 tw-ring-background-button-play"
      )}
    >
      <div className="tw-w-[32px] tw-h-[36px] tw-ml-1 tw-z-20">
        <Play />
      </div>
    </button>
  );
};
