import { Void } from "@litespace/types";
import React from "react";
import { EndSession } from "@/components/Session/EndSession";
import { ToggleButton } from "@/components/Session/ToggleButton";

export const ActionsBar: React.FC<{
  items: {
    toggle: Void;
    enabled: boolean;
    OnIcon: React.FC<{ className?: string }>;
    OffIcon: React.FC<{ className?: string }>;
    error?: boolean;
  }[];
  leave?: Void;
}> = ({ leave, items }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-gap-8">
      {leave ? <EndSession onClick={leave} /> : null}
      {items.map((item, index) => (
        <ToggleButton key={index} {...item} />
      ))}
    </div>
  );
};

export default ActionsBar;
