import React from "react";
import cn from "classnames";
import ExclamationMark from "@litespace/assets/ExclamationMark";
import { Typography } from "@/components/Typography";

export const Alert: React.FC<{ alert: string }> = ({ alert }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
      <div
        className={cn(
          "tw-rounded-full tw-flex tw-items-center tw-justify-center !tw-w-[42px] !tw-h-[42px] lg:!tw-h-16 lg:!tw-w-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-background-internet"
        )}
      >
        <ExclamationMark className="tw-w-4 tw-h-4 lg:tw-h-8 lg:tw-w-8" />
      </div>
      <Typography
        tag="span"
        className={cn(
          "tw-rounded-full lg:tw-flex tw-items-center tw-justify-center tw-text-natural-50 tw-font-bold",
          "tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-background-internet tw-text-caption"
        )}
      >
        {alert}
      </Typography>
    </div>
  );
};
