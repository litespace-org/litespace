import React from "react";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Copy } from "react-feather";

const PayWithFawryStatus: React.FC<{
  code: string,
}> = ({ code }) => {
  const intl = useFormatMessage();
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Typography tag="h1" className="text-subtitle-2 font-bold">
        {intl("checkout.status.fawry.title")}
      </Typography>

      <Typography tag="p" className="text-body font-normal">
        {intl("checkout.status.fawry.description")}
      </Typography>

      <div className="p-3 bg-natural-50">
        <Typography tag="span" className="text-body font-normal">
          {code}
        </Typography>
        <Copy />
      </div>

      <Typography tag="span" className="text-tiny font-normal">
        {intl("checkout.status.fawry.note")}
      </Typography>

      <Button
        type="main"
        size="large"
        htmlType="submit"
        className="w-full"
        disabled={false}
        loading={false}
      >
        {intl("labels.close-and-retry")}
      </Button>
    </div>
  );
};

export default PayWithFawryStatus;
