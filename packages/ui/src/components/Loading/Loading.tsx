import React from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner";
import Circle from "@litespace/assets/Circle";

export const Loading: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
}> = ({ text, size = "small" }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div
        className={cn("relative flex flex-col items-center justify-center", {
          "w-spinner-2x h-spinner-2x": size === "small",
          "w-spinner-3x h-spinner-3x": size === "medium",
          "w-spinner-5x h-spinner-5x": size === "large",
        })}
      >
        <Circle
          className={cn("absolute inset-0 stroke-natural-400", {
            "[&_circle]:stroke-[2.5]": size === "small",
            "[&_circle]:stroke-[2]": size === "medium",
            "[&_circle]:stroke-[1.5]": size === "large",
          })}
        />

        <Spinner
          className={cn("absolute inset-0 stroke-natural-600", {
            "[&_circle]:stroke-[4.5]": size === "small",
            "[&_circle]:stroke-[4.25]": size === "medium",
            "[&_circle]:stroke-[4]": size === "large",
          })}
        />
      </div>

      {text ? (
        <Typography
          tag="span"
          className={cn("text-natural-950 text-center", {
            "text-caption font-semibold": size === "medium" || size === "large",
            "text-tiny": size === "small",
          })}
        >
          {text}
        </Typography>
      ) : null}
    </div>
  );
};
