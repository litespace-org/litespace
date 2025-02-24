import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string; desktop?: boolean }
> = ({ title, description, desktop = false, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4">
      <div>
        <Typography
          tag="h2"
          className={cn("tw-text-natural-950 tw-mb-1 tw-font-regular", {
            body: !desktop,
            "subtitle-2": desktop,
          })}
        >
          {title}
        </Typography>
        <Typography
          tag="p"
          className={cn("tw-text-natural-600 tw-font-regular", {
            body: desktop,
            caption: !desktop,
          })}
        >
          {description}
        </Typography>
      </div>
      <Switch {...props} />
    </div>
  );
};
