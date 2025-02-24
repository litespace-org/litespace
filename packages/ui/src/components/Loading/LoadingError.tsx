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
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
      <div
        className={cn(
          "tw-flex tw-items-center tw-justify-center tw-bg-destructive-200 tw-rounded-full",
          {
            "tw-p-[3.33px] tw-w-10 tw-h-10": size === "small",
            "tw-p-[5.33px] tw-w-16 tw-h-16": size === "medium",
            "tw-p-[6.67px] tw-w-20 tw-h-20": size === "large",
          }
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="span"
        className={cn(
          "tw-text-natural-950 tw-text-center tw-w-[226px] sm:tw-w-full tw-mt-6 sm:tw-mt-4 tw-mb-4",
          {
            "tw-text-tiny tw-font-semibold": size === "small",
            "tw-text-caption tw-font-regular": size !== "small",
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
