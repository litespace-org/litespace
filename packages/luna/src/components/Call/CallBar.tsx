import { Void } from "@litespace/types";
import React from "react";
import { EndCallButton } from "@/components/Call/EndCallButton";
import { ToggleCallButton } from "@/components/Call/ToggleCallButton";

export const CallBar: React.FC<{
  items: {
    toggle: Void;
    enabled: boolean;
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
