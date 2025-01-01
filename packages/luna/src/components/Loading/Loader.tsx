import React from "react";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner2";

export const Loader: React.FC<{
  text?: string;
  size?: "sm" | "md" | "lg";
}> = ({ text, size = "sm" }) => {
  return (
    <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4">
      <Spinner
        className={cn("tw-fill-brand-700", {
          "tw-w-10 tw-h-10": size === "sm",
          "tw-w-16 tw-h-16": size === "md",
          "tw-w-20 tw-h-20": size === "lg",
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
