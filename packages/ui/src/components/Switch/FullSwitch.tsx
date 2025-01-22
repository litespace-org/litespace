import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string; desktop?: boolean }
> = ({ title, description, desktop = false, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4">
      <div>
        <Typography
          element={desktop ? "subtitle-2" : "body"}
          weight={desktop ? "regular" : "semibold"}
          className="tw-text-natural-950 tw-mb-1"
        >
          {title}
        </Typography>
        <Typography
          element={desktop ? "body" : "caption"}
          weight="regular"
          className="tw-text-natural-600"
        >
          {description}
        </Typography>
      </div>
      <Switch {...props} />
    </div>
  );
};
