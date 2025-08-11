import React from "react";
import Play from "@litespace/assets/Play";
import { Void } from "@litespace/types";
import cn from "classnames";

export const PlayButton: React.FC<{ togglePlay: Void }> = ({ togglePlay }) => {
  return (
    <button
      onClick={togglePlay}
      className={cn(
        "relative w-[96px] h-[96px] rounded-full backdrop-blur-[20px]",
        "overflow-hidden relative flex items-center justify-center",
        "ring-1 ring-background-button-play"
      )}
    >
      <div className="w-[32px] h-[36px] ml-1 z-20">
        <Play className="[&>*]:fill-white" />
      </div>
    </button>
  );
};
