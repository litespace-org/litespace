import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "@/components/Typography";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string }
> = ({ title, description, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4">
      <div>
        <Typography element="subtitle-2" className="tw-text-natural-950">
          {title}
        </Typography>
        <Typography element="body" className="tw-text-natural-600 tw-mt-2">
          {description}
        </Typography>
      </div>
      <Switch {...props} />
    </div>
  );
};
