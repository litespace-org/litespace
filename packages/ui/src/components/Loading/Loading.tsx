import React from "react";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import LoadingV2 from "@litespace/assets/LoadingV2";

export const Loading: React.FC<{
  text?: string;
  size?: "small" | "medium" | "large";
}> = ({ text, size = "small" }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <LoadingV2
        className={cn({
          "w-spinner-2x h-spinner-2x [&_path]:fill-[2]": size === "small",
          "w-spinner-3x h-spinner-3x [&_path]:fill-[1.5]": size === "medium",
          "w-spinner-4x h-spinner-4x [&_path]:fill-[2]": size === "large",
        })}
      />
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
