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
  variant?: "small" | "large";
}> = ({ variant = "large", retry, error }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center">
      <div
        className={cn(
          "tw-flex tw-items-center tw-justify-center tw-bg-destructive-200 tw-rounded-full",
          {
            "tw-p-[6px] tw-w-16 tw-h-16": variant === "large",
            "tw-p-[4px] tw-w-10 tw-h-10": variant === "small",
          }
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        element={variant === "large" ? "caption" : "tiny-text"}
        weight={variant === "large" ? "semibold" : "regular"}
        className="tw-text-natural-950 tw-text-center"
      >
        {error}
      </Typography>
      <Button
        size={variant === "large" ? ButtonSize.Small : ButtonSize.Tiny}
        onClick={retry}
        variant={ButtonVariant.Secondary}
      >
        {intl("global.retry")}
      </Button>
    </div>
  );
};
