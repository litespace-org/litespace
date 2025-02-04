import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";
import { LocalId } from "@litespace/ui/locales";

export const EmailVerificationError: React.FC<{
  errorMessage: LocalId | null;
  loading: boolean;
  retry: Void;
  resend: Void;
}> = ({ errorMessage, loading, retry, resend }) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
      <div
        className={cn(
          "tw-flex tw-items-center tw-justify-center tw-bg-destructive-200 tw-rounded-full",
          "tw-p-[6.67px] tw-w-20 tw-h-20"
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="caption"
        className="tw-text-natural-950 font-semibold text-caption tw-text-center tw-w-[226px] sm:tw-w-full tw-mt-6 sm:tw-mt-4 tw-mb-4"
      >
        {intl(
          errorMessage && errorMessage !== "error.unexpected"
            ? errorMessage
            : "verify-email.failure"
        )}
      </Typography>
      <div className="tw-flex tw-gap-4">
        <Button
          size="large"
          loading={loading}
          disabled={loading}
          onClick={retry}
          variant="primary"
        >
          {intl("labels.retry")}
        </Button>
        <Button
          size="large"
          loading={loading}
          disabled={loading}
          onClick={resend}
          variant="secondary"
        >
          {intl("verify-email.check-resend")}
        </Button>
      </div>
    </div>
  );
};
