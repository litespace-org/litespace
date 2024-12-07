import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";
import Error from "@litespace/assets/Error";

export const ToggleCallButton: React.FC<{
  toggle: Void;
  active: boolean;
  OnIcon: React.FC<{ className?: string }>;
  OffIcon: React.FC<{ className?: string }>;
  error?: boolean;
}> = ({ toggle, OnIcon, OffIcon, active, error = false }) => {
  return (
    <button
      className={cn(
        "tw-relative tw-w-[72px] tw-h-12 tw-rounded-lg tw-border tw-py-3 tw-px-6",
        "tw-border-brand-700 hover:tw-bg-brand-100",
        active && "tw-bg-brand-300",
        error &&
          "tw-bg-destructive-100 tw-border-destructive-700 hover:tw-bg-brand-100"
      )}
      onClick={toggle}
    >
      {active && !error ? (
        <OnIcon className={cn(active && "[&>*]:tw-stroke-brand-700")} />
      ) : (
        <OffIcon
          className={cn(
            "[&>*]:tw-stroke-brand-700",
            error && "[&>*]:tw-stroke-destructive-700"
          )}
        />
      )}
      {error ? (
        <Error className="tw-rounded-full tw-absolute -tw-top-3 -tw-left-3 tw-flex tw-items-center tw-justify-center" />
      ) : null}
    </button>
  );
};

export default ToggleCallButton;
