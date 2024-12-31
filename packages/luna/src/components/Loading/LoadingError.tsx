import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button, ButtonSize, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";

export const LoadingError: React.FC<{
  retry: Void;
  error: string;
  size: "small" | "medium" | "large";
}> = ({ retry, error, size = "small" }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center">
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
        element={size === "large" ? "caption" : "tiny-text"}
        weight={size === "large" ? "semibold" : "regular"}
        className="tw-text-natural-950 tw-text-center"
      >
        {error}
      </Typography>
      <Button
        size={size === "large" ? ButtonSize.Small : ButtonSize.Tiny}
        onClick={retry}
        variant={ButtonVariant.Secondary}
      >
        {intl("global.retry")}
      </Button>
    </div>
  );
};
