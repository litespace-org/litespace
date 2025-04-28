import React from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import Spinner from "@litespace/assets/Spinner";

export const Loader: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
}> = ({ text, size = "small" }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Spinner
        className={cn("fill-brand-700", {
          "w-10 h-10": size === "small",
          "w-16 h-16": size === "medium",
          "w-20 h-20": size === "large", // TODO: update the size of the loader to the new dimensions 72px
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
