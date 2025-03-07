import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string }
> = ({ title, description, ...props }) => {
  return (
    <div className="flex flex-row items-start justify-between gap-4 w-full">
      <div>
        <Typography
          tag="h2"
          className={cn(
            "text-natural-950 mb-1 font-semibold md:font-normal text-body md:text-subtitle-2"
          )}
        >
          {title}
        </Typography>
        <Typography
          tag="p"
          className={cn(
            "text-natural-600 font-normal text-caption md:text-body"
          )}
        >
          {description}
        </Typography>
      </div>
      <Switch {...props} />
    </div>
  );
};
