import { Void } from "@litespace/types";
import React from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import cn from "classnames";

export const EndSession: React.FC<{
  onClick: Void;
}> = ({ onClick }) => {
  return (
    <button
      className={cn(
        "tw-rounded-lg tw-w-12 lg:tw-w-14 tw-h-10 lg:tw-h-12 tw-border tw-border-destructive-700 tw-flex tw-items-center tw-justify-center",
        "tw-transition-colors tw-duration-300",
        "tw-bg-destructive-50 hover:tw-bg-destructive-100"
      )}
      onClick={onClick}
    >
      <CallIncoming className="[&>*]:tw-stroke-destructive-700" />
    </button>
  );
};

export default EndSession;
