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
        "w-3 h-3 inline-block absolute z-10 bottom-0 left-0 md:bottom-0.5 md:left-0.5 rounded-full shadow-md ring ring-dash-sidebar",
        {
          "bg-gray-500": status === UserOnlineStatus.InActive,
          "bg-amber-700 dark:bg-amber-900":
            status === UserOnlineStatus.WasActive,
          "bg-brand-8 dark:bg-brand-9": status === UserOnlineStatus.Active,
        },
        className
      )}
    />
  );
};

export default OnlineStatus;
