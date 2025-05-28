import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Link } from "react-router-dom";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";

import { LITESPACE_NOTIFY_URL } from "@litespace/utils/constants";

function renderUrl(value: React.ReactNode): React.JSX.Element {
  return (
    <Link target="_blank" to={LITESPACE_NOTIFY_URL} className="text-brand-700">
      {value}
    </Link>
  );
}

export const UnresolvedPhone: React.FC<{
  resend: Void;
  sendingCode: boolean;
}> = ({ resend, sendingCode }) => {
  const intl = useFormatMessage();

  return (
    <div className="pt-2 flex flex-col gap-4">
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl("verify-dialog.telegram.privacy-issue.description-1")}
      </Typography>
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl.rich("verify-dialog.telegram.privacy-issue.description-2", {
          link: renderUrl,
        })}
      </Typography>
      <Typography
        tag="h6"
        className="text-caption font-semibold text-natural-950"
      >
        {intl.rich("verify-dialog.telegram.privacy-issue.description-3", {
          link: renderUrl,
        })}
      </Typography>
      <div className="flex flex-row items-center gap-6 w-full">
        <Button
          onClick={resend}
          disabled={sendingCode}
          loading={sendingCode}
          size="large"
          className="grow"
        >
          {intl("labels.try-again")}
        </Button>
        <Button
          onClick={close}
          variant="secondary"
          className="grow"
          size="large"
          disabled={sendingCode}
        >
          {intl("labels.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default UnresolvedPhone;
