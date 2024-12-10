import React from "react";
import cn from "classnames";
import ExclamationMark from "@litespace/assets/ExclamationMark";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";

export const InternetIndicator: React.FC = () => {
  const intl = useFormatMessage();
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
        {intl("call.internet.problem")}
      </Typography>
    </div>
  );
};
