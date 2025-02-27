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
        "relative w-[72px] h-12 rounded-lg border py-3 px-6",
        "transition-colors duration-300",
        {
          "hover:bg-brand-100 border-brand-700": !enabled,
          "bg-brand-200 hover:bg-brand-100 border-brand-700": enabled,
          "bg-destructive-100 border-destructive-700 hover:bg-destructive-50":
            error,
        }
      )}
      onClick={toggle}
    >
      {enabled && !error ? (
        <OnIcon className="[&>*]:stroke-brand-700" />
      ) : (
        <OffIcon
          className={cn(
            "[&>*]:stroke-brand-700",
            error && "[&>*]:stroke-destructive-700"
          )}
        />
      )}
      {error ? (
        <div className="w-6 rounded-full h-6 flex items-center justify-center bg-destructive-400 border-[3px] border-destructive-600 absolute -top-3 -left-3 ">
          <Error />
        </div>
      ) : null}
    </button>
  );
};

export default ToggleButton;
