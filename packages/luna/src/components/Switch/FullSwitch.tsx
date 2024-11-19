import React from "react";
import { Switch, SwitchProps } from "@/components/Switch/Switch";
import { Typography } from "../Typography";

export const FullSwitch: React.FC<
  SwitchProps & { title: string; description: string }
> = ({ title, description, ...props }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-gap-4">
      <Switch {...props} />
      <div>
        <Typography element="subtitle-2" className="tw-text-natural-950">
          {title}
        </Typography>
        <Typography element="body" className="tw-text-natural-600 tw-mt-2">
          {description}
        </Typography>
      </div>
    </div>
  );
};
