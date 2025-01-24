import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string; isLargeScreen: boolean }
> = ({ title, description, isLargeScreen, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4">
      <div>
        <Typography
          element={isLargeScreen ? "subtitle-2" : "body"}
          weight={isLargeScreen ? "regular" : "semibold"}
          className="tw-text-natural-950 tw-mb-1"
        >
          {title}
        </Typography>
        <Typography
          element={isLargeScreen ? "body" : "caption"}
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
