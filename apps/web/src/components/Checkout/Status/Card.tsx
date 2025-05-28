import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Void } from "@litespace/types";

const Status: React.FC<{
  cancel: Void;
  canceling: boolean;
  disabled: boolean;
}> = ({ cancel, canceling, disabled }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-[350px]">
      <Typography tag="p" className="text-body font-medium text-center">
        {intl("checkout.status.card.desc")}
      </Typography>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        className="w-full"
        disabled={canceling || disabled}
        loading={canceling}
        onClick={cancel}
      >
        {intl("checkout.payment.cancel-and-retry")}
      </Button>
    </div>
  );
};

export default Status;
