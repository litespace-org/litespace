import React from "react";
import cn from "classnames";
import ExclamationMark from "@litespace/assets/ExclamationMark";
import { Typography } from "@/components/Typography";

export const Alert: React.FC<{ alert: string }> = ({ alert }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
      <div
        className={cn(
          "tw-rounded-full tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-background-internet"
        )}
      >
        <ExclamationMark />
      </div>
      <Typography
        element="caption"
        className={cn(
          "tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-natural-50 tw-font-bold tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-background-internet"
        )}
      >
        {alert}
      </Typography>
    </div>
  );
};
