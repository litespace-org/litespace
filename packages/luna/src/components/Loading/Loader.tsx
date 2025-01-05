import React from "react";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner";

export const Loader: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
}> = ({ text, size = "small" }) => {
  return (
    <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4">
      <Spinner
        className={cn("tw-fill-brand-700", {
          "tw-w-10 tw-h-10": size === "small",
          "tw-w-16 tw-h-16": size === "medium",
          "tw-w-20 tw-h-20": size === "large",
        })}
      />

      {text ? (
        <Typography
          element="caption"
          weight="semibold"
          className="tw-text-natural-950 tw-text-center"
        >
          {text}
        </Typography>
      ) : null}
    </div>
  );
};
