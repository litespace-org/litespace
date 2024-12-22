import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button, ButtonVariant } from "@litespace/luna/Button";
import { useFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";
import React from "react";

export const LoadingError: React.FC<{ retry: Void; error: string }> = ({
  retry,
  error,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center">
      <div className="tw-p-[6px] tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-destructive-200 tw-rounded-full">
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
