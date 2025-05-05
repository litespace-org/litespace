import React from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner";

export const Loading: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}> = ({ text, size = "small", className }) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-4",
        className
      )}
    >
      <Spinner
        className={cn("fill-natural-700", {
          "w-8 h-8": size === "small",
          "w-14 h-14": size === "medium",
          "w-[72px] h-[72px]": size === "large", // TODO: update the size of the loading to the new dimensions 72px
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
