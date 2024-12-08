import { Void } from "@litespace/types";
import React from "react";
import { ToggleCallButton, EndCallButton } from "@/components/Call";

export const CallBar: React.FC<{
  items: {
    toggle: Void;
    active: boolean;
    OnIcon: React.FC<{ className?: string }>;
    OffIcon: React.FC<{ className?: string }>;
    error?: boolean;
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
