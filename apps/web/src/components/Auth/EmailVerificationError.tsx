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
  resending: boolean;
  reverifying: boolean;
  retry: Void;
  resend: Void;
}> = ({ errorMessage, resending, reverifying, retry, resend }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          "flex items-center justify-center bg-destructive-200 rounded-full",
          "p-[3px] sm:p-[7px] w-10 h-10 sm:w-20 sm:h-20"
        )}
      >
        <ExclaimationMarkCircle />
      </div>
      <Typography
        tag="p"
        className="text-natural-950 text-tiny sm:text-caption sm:font-semibold text-center max-w-[226px] sm:w-full my-4"
      >
        {intl(
          errorMessage && errorMessage !== "error.unexpected"
            ? errorMessage
            : "verify-email.failure"
        )}
      </Typography>
      <div className="flex gap-4">
        <Button
          size="large"
          loading={reverifying}
          disabled={reverifying}
          onClick={retry}
          variant="primary"
        >
          {intl("labels.retry")}
        </Button>
        <Button
          size="large"
          loading={resending}
          disabled={resending}
          onClick={resend}
          variant="secondary"
        >
          {intl("verify-email.check-resend")}
        </Button>
      </div>
    </div>
  );
};
