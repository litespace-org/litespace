import React from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner";

export const Loading: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
}> = ({ text, size = "small" }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Spinner
        className={cn("stroke-natural-600", {
          "w-spinner-2x h-spinner-2x [&_circle]:stroke-[2]": size === "small",
          "w-spinner-3x h-spinner-3x [&_circle]:stroke-[1.5]":
            size === "medium",
          "w-spinner-4x h-spinner-4x [&_circle]:stroke-[1]": size === "large",
        })}
      />

      {text ? (
        <Typography
          tag="span"
          className="text-natural-950 text-center text-caption font-semibold"
        >
          {text}
        </Typography>
      ) : null}
    </div>
  );
};
