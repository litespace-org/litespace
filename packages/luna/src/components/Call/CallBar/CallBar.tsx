import { Void } from "@litespace/types";
import React from "react";
import { EndCallButton } from "../EndCallButton";
import { ToggleCallButton } from "../ToggleCallButton";

export const CallBar: React.FC<{
  items: {
    toggleFunction: Void;
    ToggleIcon: {
      On: React.FC<{ className?: string }>;
      Off: React.FC<{ className?: string }>;
    };
    toggleState: boolean;
    hasError?: boolean;
  }[];
  leaveCall?: Void;
}> = ({ leaveCall, items }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-gap-8">
      {leaveCall ? <EndCallButton leaveCall={leaveCall} /> : null}
      {items.map((item, index) => (
        <ToggleCallButton key={index} {...item} />
      ))}
    </div>
  );
};

export default CallBar;
