import React from "react";
import { Typography } from "@litespace/luna/Typography";
import cn from "classnames";

export const Loader: React.FC<{
  text?: string;
  variant?: "small" | "large";
}> = ({ text, variant = "large" }) => {
  return (
    <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4">
      <div
        style={{
          animationDirection: "reverse",
        }}
        className={cn(
          "tw-animate-spin tw-flex tw-items-center tw-relative tw-rounded-full tw-justify-center tw-bg-loader",
          {
            "tw-w-[64px] tw-h-[64px]": variant === "small",
            "tw-w-[80px] tw-h-[80px]": variant === "large",
          }
        )}
      >
        <div
          className={cn("tw-bg-white tw-rounded-full", {
            "tw-w-[48px] tw-h-[48px]": variant === "small",
            "tw-w-[60px] tw-h-[60px]": variant === "large",
          })}
        />
        <div
          className={cn(
            "tw-bg-background-loader-spinner tw-rounded-full tw-absolute tw-bottom-0 tw-left-1/2 -tw-translate-x-1/2",
            {
              "tw-w-[10px] tw-h-[7px]": variant === "small",
              "tw-w-[13px] tw-h-[10px]": variant === "large",
            }
          )}
        />
      </div>

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
