import React from "react";
import cn from "classnames";
import ExclamationMark from "@litespace/assets/ExclamationMark";
import { Typography } from "@litespace/ui/Typography";

export const Alert: React.FC<{ alert: string }> = ({ alert }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={cn(
          "rounded-full flex items-center justify-center !w-[42px] !h-[42px] lg:!h-16 lg:!w-16 backdrop-blur-[15px] p-4 bg-background-internet"
        )}
      >
        <ExclamationMark className="w-4 h-4 lg:h-8 lg:w-8" />
      </div>
      <Typography
        tag="span"
        className={cn(
          "rounded-full lg:flex items-center justify-center text-natural-50 font-bold",
          "h-16 backdrop-blur-[15px] p-4 bg-background-internet text-caption"
        )}
      >
        {alert}
      </Typography>
    </div>
  );
};
