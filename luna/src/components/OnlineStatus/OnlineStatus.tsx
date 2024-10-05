import React from "react";
import cn from "classnames";
import { UserOnlineStatus } from "@/components/OnlineStatus/types";

const OnlineStatus: React.FC<{
  status: UserOnlineStatus;
  className?: string;
}> = ({ status, className }) => {
  return (
    <span
      className={cn(
        "tw-w-3 tw-h-3 tw-inline-block tw-absolute tw-z-10 tw-bottom-0 tw-left-0 md:tw-bottom-0.5 md:tw-left-0.5 tw-rounded-full tw-shadow-md tw-ring tw-ring-dash-sidebar",
        {
          "tw-bg-gray-500": status === UserOnlineStatus.InActive,
          "tw-bg-amber-700 dark:tw-bg-amber-900":
            status === UserOnlineStatus.WasActive,
          "tw-bg-brand-8 dark:tw-bg-brand-9":
            status === UserOnlineStatus.Active,
        },
        className
      )}
    />
  );
};

export default OnlineStatus;
