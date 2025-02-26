import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string }
> = ({ title, description, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4 lg:tw-max-w-[467px] tw-w-full">
      <div>
        <Typography
          tag="h2"
          className={cn(
            "tw-text-natural-950 tw-mb-1 tw-font-semibold md:tw-font-regular tw-text-body md:tw-text-subtitle-2"
          )}
        >
          {title}
        </Typography>
        <Typography
          tag="p"
          className={cn(
            "tw-text-natural-600 tw-font-regular tw-text-caption md:tw-text-body"
          )}
        >
          {description}
        </Typography>
      </div>
      <Switch {...props} />
    </div>
  );
};
