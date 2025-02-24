import React from "react";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const CheckEmail: React.FC<{ resending: boolean; resend: Void }> = ({
  resend,
  resending,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-flex-col tw-gap-6 tw-justify-center tw-items-center tw-text-center tw-grow">
      <div className="tw-flex tw-flex-col tw-gap-2">
        <Typography
          tag="h4"
          className="text-natural-950 font-bold sm:font-semibold text-subtitle-1 sm:text-h4"
        >
          {intl("verify-email.check.title")}
        </Typography>
        <Typography
          tag="p"
          className="tw-text-natural-700 tw-max-w-[554px] text-tiny sm:text-body"
        >
          {intl("verify-email.check.description")}
        </Typography>
      </div>
      <Button
        disabled={resending}
        loading={resending}
        onClick={resend}
        variant="tertiary"
      >
        {intl("verify-email.check-resend")}
      </Button>
    </div>
  );
};

export default CheckEmail;
