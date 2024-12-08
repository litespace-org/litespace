import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";
import CallIncoming from "@litespace/assets/CallIncoming";

export const EndCallButton: React.FC<{
  leaveCall: Void;
}> = ({ leaveCall }) => {
  return (
    <button
      className={cn(
        "tw-relative tw-w-[72px] tw-h-12 tw-rounded-lg tw-border tw-py-3 tw-px-6",
        "tw-border-destructive-700 hover:tw-bg-destructive-100 active:tw-bg-destructive-700 group"
      )}
      onClick={leaveCall}
    >
      {/* TODO: the icon doesn't turn to white when clicked */}
      <CallIncoming className="group-active:tw-stroke-destructive-50 [&>*]:tw-stroke-destructive-700 " />
    </button>
  );
};

export default EndCallButton;
