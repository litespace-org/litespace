import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";
import Error from "@litespace/assets/Error";

export const ToggleButton: React.FC<{
  toggle: Void;
  enabled: boolean;
  OnIcon: React.FC<{ className?: string }>;
  OffIcon: React.FC<{ className?: string }>;
  error?: boolean;
}> = ({ toggle, OnIcon, OffIcon, enabled, error = false }) => {
  return (
    <button
      className={cn(
        "tw-relative tw-w-12 lg:tw-w-14 tw-h-10 lg:tw-h-12 tw-rounded-lg tw-border tw-flex tw-items-center tw-justify-center",
        "tw-transition-colors tw-duration-300",
        {
          "hover:tw-bg-brand-100 tw-border-brand-700 tw-bg-brand-50": !enabled,
          "tw-bg-brand-700 hover:tw-bg-brand-600 hover:tw-border-[#0A291A33] tw-border-[#0A291A33] focus-within:tw-border-[#0A291A80] active:tw-border-[#0A291A80]":
            enabled,
          "tw-bg-destructive-100 tw-border-destructive-700 hover:tw-bg-destructive-50":
            error,
        }
      )}
      onClick={toggle}
    >
      {enabled && !error ? (
        <OnIcon
          className={cn("tw-w-4 tw-h-4 lg:tw-w-6 lg:tw-h-6", {
            "[&>*]:tw-stroke-natural-50": enabled && !error,
            "[&>*]:tw-stroke-brand-700": !enabled && !error,
            "[&>*]:tw-stroke-destructive-700": error,
          })}
        />
      ) : (
        <OffIcon
          className={cn("tw-w-4 tw-h-4 lg:tw-w-6 lg:tw-h-6", {
            "[&>*]:tw-stroke-natural-50": enabled && !error,
            "[&>*]:tw-stroke-brand-700": !enabled && !error,
            "[&>*]:tw-stroke-destructive-700": error,
          })}
        />
      )}
      {error ? (
        <div
          className={cn(
            "tw-w-4 lg:tw-w-6 tw-rounded-full tw-h-4 lg:tw-h-6 tw-flex tw-items-center tw-justify-center",
            "tw-bg-destructive-400 tw-border-[3px] tw-border-destructive-600 tw-absolute -tw-top-1 -tw-left-1 lg:-tw-top-3 lg:-tw-left-3"
          )}
        >
          <Error className="[&_*]:tw-stroke-natural-50" />
        </div>
      ) : null}
    </button>
  );
};

export default ToggleButton;
