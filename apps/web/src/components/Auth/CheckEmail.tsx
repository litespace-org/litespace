import React from "react";
import { Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

const CheckEmail: React.FC<{ resend: Void }> = ({ resend }) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-flex-col tw-gap-6 tw-justify-center tw-items-center tw-text-center tw-grow">
      <div className="tw-flex tw-flex-col tw-gap-2">
        <Typography
          element={"h4"}
          weight="semibold"
          className="text-natural-950"
        >
          {intl("page.check.email.title")}{" "}
        </Typography>
        <Typography
          element="body"
          className="tw-text-natural-700 tw-max-w-[554px]"
        >
          {intl("page.check.email.description")}{" "}
        </Typography>
      </div>
      <Button onClick={resend} variant={"tertiary"}>
        {intl("page.check.email.resend")}
      </Button>
    </div>
  );
};

export default CheckEmail;
