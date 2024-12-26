import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";

export const LoadingError: React.FC<{
  retry: Void;
  error: string;
  variant?: "small" | "medium" | "large";
}> = ({ retry, error, variant = "large" }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center">
      <div
        className={cn(
          "tw-p-[6px] tw-flex tw-items-center tw-justify-center tw-bg-destructive-200 tw-rounded-full",
          { "tw-w-10 tw-h-10": variant === "small" },
          { "tw-w-16 tw-h-16": variant === "medium" },
          { "tw-w-20 tw-h-20": variant === "large" }
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        element="caption"
        weight="semibold"
        className="tw-text-natural-950 tw-text-center"
      >
        {error}
      </Typography>
      <Button onClick={retry} variant={ButtonVariant.Secondary}>
        {intl("global.retry")}
      </Button>
    </div>
  );
};
