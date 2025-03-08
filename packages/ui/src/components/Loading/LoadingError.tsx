import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";

export const LoadingError: React.FC<{
  retry: Void;
  error: string;
  size?: "small" | "medium" | "large";
}> = ({ retry, error, size = "small" }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "flex items-center justify-center bg-destructive-200 rounded-full",
          {
            "p-[3.33px] w-10 h-10": size === "small",
            "p-[5.33px] w-16 h-16": size === "medium",
            "p-[6.67px] w-20 h-20": size === "large",
          }
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="span"
        className={cn(
          "text-natural-950 text-center w-[226px] sm:w-full mt-6 sm:mt-4 mb-4",
          {
            "text-tiny font-semibold": size === "small",
            "text-caption font-normal": size !== "small",
          }
        )}
      >
        {error}
      </Typography>
      <Button
        size={size === "large" ? "medium" : "small"}
        onClick={retry}
        variant={"secondary"}
      >
        {intl("labels.retry")}
      </Button>
    </div>
  );
};
